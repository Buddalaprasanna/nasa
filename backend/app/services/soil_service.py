"""
soil_service.py - Smart Soil Identification Service for Field Shift.

Integrates:
1. ISRIC SoilGrids 2.0 Global Soil Data (REST API query for sand, clay, silt, pH, SOC).
2. ICAR-NBSS&LUP (National Bureau of Soil Survey and Land Use Planning) agro-ecological
   district reference dataset for Indian agricultural regions.
3. USDA Soil Texture Triangle classification.

Important transparency note:
This service provides an agro-ecological ESTIMATE based on spatial satellite models
and regional survey data. It is explicitly not a laboratory chemical soil test.
"""

import json
import logging
import math
import ssl
import urllib.request
import urllib.error
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger("field_shift.soil_service")

# ICAR-NBSS&LUP Regional Benchmark Soil Profiles for Indian Districts
# Based on ICAR Agro-Ecological Sub-Regions (AESR) and District Soil Atlases
ICAR_DISTRICT_PROFILES: Dict[str, Dict[str, Any]] = {
    # Karnataka
    "mandya": {
        "soil_type": "red",
        "soil_name": "Red Sandy Loam (Typic Kanhaplustalfs)",
        "texture": "Sandy Loam",
        "sand_pct": 58.5,
        "clay_pct": 18.2,
        "silt_pct": 23.3,
        "ph": 6.4,
        "ph_label": "Slightly Acidic (Optimal for most crops)",
        "organic_carbon_pct": 0.52,
        "organic_carbon_label": "Medium (0.50 - 0.75%)",
        "drainage": "Well drained",
        "water_holding_capacity": "Medium (95-125 mm/m)",
        "suitable_crops_hint": "Finger millet (ragi), groundnut, pulses (redgram, cowpea), sugarcane in irrigated pockets.",
        "management_tips": "Incorporate farmyard manure (FYM) or green manure to enhance organic matter and moisture retention."
    },
    "mysuru": {
        "soil_type": "red",
        "soil_name": "Red Loam with Clay Pockets (Alfisols / Inceptisols)",
        "texture": "Sandy Clay Loam",
        "sand_pct": 52.0,
        "clay_pct": 24.5,
        "silt_pct": 23.5,
        "ph": 6.7,
        "ph_label": "Near Neutral (Ideal nutrient availability)",
        "organic_carbon_pct": 0.58,
        "organic_carbon_label": "Medium (0.50 - 0.75%)",
        "drainage": "Moderately well drained",
        "water_holding_capacity": "Medium to High (130 mm/m)",
        "suitable_crops_hint": "Ragi, pulses, groundnut, cotton, and vegetables.",
        "management_tips": "Practice contour cultivation and maintain organic mulch during dry spells."
    },
    "tumakuru": {
        "soil_type": "red",
        "soil_name": "Red Gravelly Sandy Loam (Ustic Paleustalfs)",
        "texture": "Sandy Loam",
        "sand_pct": 64.0,
        "clay_pct": 16.0,
        "silt_pct": 20.0,
        "ph": 6.2,
        "ph_label": "Moderately Acidic to Neutral",
        "organic_carbon_pct": 0.44,
        "organic_carbon_label": "Low to Medium (< 0.50%)",
        "drainage": "Rapid to well drained",
        "water_holding_capacity": "Low to Moderate (80-100 mm/m)",
        "suitable_crops_hint": "Groundnut, ragi, castor, redgram, and minor millets.",
        "management_tips": "Mulching and tank silt application are highly beneficial to improve water retention."
    },
    "kolar": {
        "soil_type": "red",
        "soil_name": "Red Sandy Loam (Alfisols)",
        "texture": "Sandy Loam",
        "sand_pct": 62.0,
        "clay_pct": 17.5,
        "silt_pct": 20.5,
        "ph": 6.5,
        "ph_label": "Slightly Acidic to Neutral",
        "organic_carbon_pct": 0.48,
        "organic_carbon_label": "Low to Medium",
        "drainage": "Well drained",
        "water_holding_capacity": "Moderate (90 mm/m)",
        "suitable_crops_hint": "Ragi, groundnut, tomato, mulberry, and vegetables.",
        "management_tips": "Drip irrigation and vermicompost application optimize water and nutrient use."
    },
    "chikkaballapur": {
        "soil_type": "red",
        "soil_name": "Red Sandy Loam to Sandy Clay Loam",
        "texture": "Sandy Loam",
        "sand_pct": 60.5,
        "clay_pct": 19.0,
        "silt_pct": 20.5,
        "ph": 6.6,
        "ph_label": "Near Neutral",
        "organic_carbon_pct": 0.46,
        "organic_carbon_label": "Low to Medium",
        "drainage": "Well drained",
        "water_holding_capacity": "Moderate (95 mm/m)",
        "suitable_crops_hint": "Millets, maize, groundnut, grapes, and horticulture crops.",
        "management_tips": "Subsurface drip and conservation tillage conserve topsoil moisture."
    },
    "belagavi": {
        "soil_type": "black",
        "soil_name": "Deep Black Clay Soil (Typic Haplusterts / Regur)",
        "texture": "Clay Loam",
        "sand_pct": 24.0,
        "clay_pct": 46.0,
        "silt_pct": 30.0,
        "ph": 7.9,
        "ph_label": "Moderately Alkaline (High Calcium Carbonate)",
        "organic_carbon_pct": 0.62,
        "organic_carbon_label": "Medium (0.50 - 0.75%)",
        "drainage": "Slow / Moderately drained",
        "water_holding_capacity": "Very High (180-220 mm/m)",
        "suitable_crops_hint": "Cotton, soybean, chickpea (Bengal gram), sugarcane, wheat, and sorghum.",
        "management_tips": "Provide broadbed furrow (BBF) drainage during heavy rains; deep plowing in summer."
    },
    "dharwad": {
        "soil_type": "black",
        "soil_name": "Medium to Deep Black Soil (Vertisols)",
        "texture": "Clay Loam",
        "sand_pct": 28.0,
        "clay_pct": 42.0,
        "silt_pct": 30.0,
        "ph": 7.8,
        "ph_label": "Slightly to Moderately Alkaline",
        "organic_carbon_pct": 0.59,
        "organic_carbon_label": "Medium",
        "drainage": "Moderately drained",
        "water_holding_capacity": "High (170 mm/m)",
        "suitable_crops_hint": "Cotton, groundnut, chickpea, sorghum, and chilli.",
        "management_tips": "Incorporate crop residues to prevent crusting and improve soil structure."
    },
    "kalaburagi": {
        "soil_type": "black",
        "soil_name": "Deep Black Cotton Soil (Chromic Haplusterts)",
        "texture": "Clay",
        "sand_pct": 20.0,
        "clay_pct": 52.0,
        "silt_pct": 28.0,
        "ph": 8.2,
        "ph_label": "Alkaline (High buffering capacity)",
        "organic_carbon_pct": 0.49,
        "organic_carbon_label": "Low to Medium",
        "drainage": "Slow / Imperfectly drained",
        "water_holding_capacity": "Very High (210 mm/m)",
        "suitable_crops_hint": "Pigeon pea (tur / redgram capital of Karnataka), chickpea, sunflower, and sorghum.",
        "management_tips": "Ensure surface drainage to avoid waterlogging during early seedling stages."
    },
    # Tamil Nadu
    "dharmapuri": {
        "soil_type": "red",
        "soil_name": "Red Sandy Loam (Typic Rhodustalfs)",
        "texture": "Sandy Loam",
        "sand_pct": 59.0,
        "clay_pct": 18.0,
        "silt_pct": 23.0,
        "ph": 6.5,
        "ph_label": "Slightly Acidic to Neutral",
        "organic_carbon_pct": 0.47,
        "organic_carbon_label": "Low to Medium",
        "drainage": "Well drained",
        "water_holding_capacity": "Moderate (95 mm/m)",
        "suitable_crops_hint": "Ragi, groundnut, samai (little millet), pulses, and tomato.",
        "management_tips": "Intercropping pulses with millets protects soil cover and fixes nitrogen."
    },
    "coimbatore": {
        "soil_type": "red",
        "soil_name": "Red and Black Mixed Loam (Alfisols / Vertic Inceptisols)",
        "texture": "Sandy Clay Loam",
        "sand_pct": 48.0,
        "clay_pct": 28.0,
        "silt_pct": 24.0,
        "ph": 7.4,
        "ph_label": "Neutral to Mildly Alkaline",
        "organic_carbon_pct": 0.54,
        "organic_carbon_label": "Medium",
        "drainage": "Moderately well drained",
        "water_holding_capacity": "Medium to High (140 mm/m)",
        "suitable_crops_hint": "Cotton, maize, sorghum, pulses, and turmeric.",
        "management_tips": "Alternate furrow irrigation to optimize water and reduce salinity risks."
    },
    # Andhra Pradesh & Telangana
    "anantapur": {
        "soil_type": "red",
        "soil_name": "Red Sandy Soil / Shallow Red Loam (Alfisols)",
        "texture": "Sandy Loam",
        "sand_pct": 68.0,
        "clay_pct": 14.5,
        "silt_pct": 17.5,
        "ph": 7.3,
        "ph_label": "Neutral to Mildly Alkaline",
        "organic_carbon_pct": 0.38,
        "organic_carbon_label": "Low (< 0.50%)",
        "drainage": "Excessively to well drained",
        "water_holding_capacity": "Low (75 mm/m)",
        "suitable_crops_hint": "Groundnut (rainfed staple), pigeon pea, castor, foxtail millet (korra).",
        "management_tips": "Dead furrows at 3.6m intervals to harvest runoff moisture; apply organic compost."
    },
    "kurnool": {
        "soil_type": "black",
        "soil_name": "Black Clayey Soil (Vertisols) and Red Loam",
        "texture": "Clay Loam",
        "sand_pct": 32.0,
        "clay_pct": 42.0,
        "silt_pct": 26.0,
        "ph": 7.9,
        "ph_label": "Moderately Alkaline",
        "organic_carbon_pct": 0.51,
        "organic_carbon_label": "Medium",
        "drainage": "Moderately drained",
        "water_holding_capacity": "High (160 mm/m)",
        "suitable_crops_hint": "Bengal gram (chickpea), cotton, groundnut, sunflower, and foxtail millet.",
        "management_tips": "Zero-tillage or minimum tillage helps conserve residual black-soil moisture."
    },
    "guntur": {
        "soil_type": "black",
        "soil_name": "Deep Black Cotton Soil & Coastal Alluvium",
        "texture": "Clay Loam",
        "sand_pct": 26.0,
        "clay_pct": 45.0,
        "silt_pct": 29.0,
        "ph": 7.8,
        "ph_label": "Moderately Alkaline",
        "organic_carbon_pct": 0.65,
        "organic_carbon_label": "Medium",
        "drainage": "Moderately slow",
        "water_holding_capacity": "High (180 mm/m)",
        "suitable_crops_hint": "Chilli, cotton, paddy, tobacco, and pulses (blackgram, greengram).",
        "management_tips": "Integrated nutrient management with biofertilizers helps reduce high chemical input."
    }
}


def classify_usda_texture(sand: float, silt: float, clay: float) -> str:
    """Classify soil texture using the USDA Soil Texture Triangle."""
    if clay >= 40:
        if sand >= 45:
            return "Sandy Clay"
        elif silt >= 40:
            return "Silty Clay"
        return "Clay"
    elif 27 <= clay < 40:
        if sand >= 45:
            return "Sandy Clay Loam"
        elif sand < 20:
            return "Silty Clay Loam"
        return "Clay Loam"
    elif 20 <= clay < 27:
        if sand >= 52:
            return "Sandy Clay Loam"
        elif silt >= 50:
            return "Silty Loam"
        return "Loam"
    else:  # clay < 20
        if sand >= 85:
            return "Sand"
        elif sand >= 70:
            return "Loamy Sand"
        elif sand >= 52 or (sand >= 43 and silt < 50):
            return "Sandy Loam"
        elif silt >= 80:
            return "Silt"
        elif silt >= 50:
            return "Silt Loam"
        return "Loam"


def map_texture_to_field_shift_soil(texture: str, lat: float, lon: float, state: str = "") -> str:
    """Map USDA texture and geographic location to Field Shift primary categories."""
    texture_lower = texture.lower()
    
    # Vertisols / Black soils dominate Deccan plateau (Karnataka, Maharashtra, AP, MP)
    if "clay" in texture_lower and (14.0 <= lat <= 22.0 and 73.0 <= lon <= 80.0):
        return "black"
    elif "clay" in texture_lower:
        return "other"
    
    if "sand" in texture_lower and "loam" not in texture_lower:
        return "sandy"
    
    # Red soils dominate South Indian peninsular granitic belt
    if 10.0 <= lat <= 16.0:
        return "red"
    
    if "sandy loam" in texture_lower or "loam" in texture_lower:
        return "red"
        
    return "other"


def query_isric_soilgrids(lat: float, lon: float, timeout_secs: float = 3.0) -> Optional[Dict[str, Any]]:
    """
    Query ISRIC SoilGrids 2.0 REST API for topsoil (0-5cm and 5-15cm).
    Returns None gracefully if the service is unreachable or times out.
    """
    url = (
        f"https://rest.isric.org/soilgrids/v2.0/properties/query"
        f"?lon={lon:.4f}&lat={lat:.4f}"
        f"&property=clay&property=sand&property=silt&property=phh2o&property=soc"
        f"&depth=0-5cm&depth=5-15cm&value=mean"
    )
    headers = {
        "User-Agent": "FieldShift/1.0 (Agricultural Decision Support; Non-Commercial)",
        "Accept": "application/json"
    }

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout_secs, context=ctx) as response:
            if response.status == 200:
                return json.loads(response.read().decode("utf-8"))
    except Exception as ex:
        logger.info(f"ISRIC SoilGrids query did not respond ({ex}); using ICAR agro-ecological survey.")
        return None
    return None


def parse_isric_layers(data: Dict[str, Any]) -> Optional[Dict[str, float]]:
    """Extract mean soil values across 0-15cm depths from ISRIC SoilGrids response."""
    try:
        layers = data.get("properties", {}).get("layers", [])
        values = {}
        for layer in layers:
            name = layer.get("name")
            depths = layer.get("depths", [])
            depth_means = []
            for d in depths:
                mean_val = d.get("values", {}).get("mean")
                if mean_val is not None:
                    depth_means.append(mean_val)
            if depth_means:
                values[name] = sum(depth_means) / len(depth_means)

        if "sand" in values and "clay" in values and "silt" in values:
            # SoilGrids returns texture in g/kg (e.g. 240 g/kg = 24%)
            sand_pct = round(values["sand"] / 10.0, 1)
            clay_pct = round(values["clay"] / 10.0, 1)
            silt_pct = round(values["silt"] / 10.0, 1)
            
            # Normalize to 100%
            total = sand_pct + clay_pct + silt_pct
            if total > 0:
                sand_pct = round((sand_pct / total) * 100.0, 1)
                clay_pct = round((clay_pct / total) * 100.0, 1)
                silt_pct = round((silt_pct / total) * 100.0, 1)

            # pH is returned in pH * 10 (e.g. 64 = 6.4)
            ph = round(values.get("phh2o", 65) / 10.0, 1)
            
            # SOC is returned in dg/kg (e.g. 55 dg/kg = 0.55%)
            soc_pct = round(values.get("soc", 50) / 100.0, 2)

            return {
                "sand_pct": sand_pct,
                "clay_pct": clay_pct,
                "silt_pct": silt_pct,
                "ph": ph,
                "soc_pct": soc_pct
            }
    except Exception as err:
        logger.warning(f"Failed parsing SoilGrids layers: {err}")
    return None


class SoilService:
    """Provides transparent, multi-source soil identification for farmers."""

    @classmethod
    def identify_soil_profile(
        cls,
        latitude: float,
        longitude: float,
        district: Optional[str] = None,
        state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Identify farm soil characteristics from GPS coordinates and district context.
        Uses ISRIC SoilGrids with automatic ICAR-NBSS&LUP benchmark fallback.
        """
        district_key = (district or "").strip().lower()
        state_str = (state or "").strip()

        # Step 1: Check ICAR district profile first for regional Indian expertise
        icar_profile = ICAR_DISTRICT_PROFILES.get(district_key)

        # Step 2: Query ISRIC SoilGrids 2.0 (with 3-second safety timeout)
        isric_raw = query_isric_soilgrids(latitude, longitude, timeout_secs=3.0)
        isric_parsed = parse_isric_layers(isric_raw) if isric_raw else None

        if isric_parsed:
            sand = isric_parsed["sand_pct"]
            clay = isric_parsed["clay_pct"]
            silt = isric_parsed["silt_pct"]
            ph = isric_parsed["ph"]
            soc = isric_parsed["soc_pct"]
            texture = classify_usda_texture(sand, silt, clay)
            soil_type = map_texture_to_field_shift_soil(texture, latitude, longitude, state_str)

            # Descriptive labeling
            if ph < 5.5:
                ph_label = "Strongly Acidic (Lime application recommended)"
            elif 5.5 <= ph < 6.5:
                ph_label = "Slightly Acidic (Good for millets, tea, groundnut)"
            elif 6.5 <= ph <= 7.5:
                ph_label = "Neutral (Optimal for most agricultural crops)"
            elif 7.5 < ph <= 8.5:
                ph_label = "Slightly Alkaline (Calcareous, good for cotton, pulses)"
            else:
                ph_label = "Strongly Alkaline (Gypsum application advised)"

            if soc < 0.5:
                soc_label = "Low (< 0.50% - Needs organic manure)"
            elif soc <= 0.75:
                soc_label = "Medium (0.50 - 0.75% - Normal Indian tropical range)"
            else:
                soc_label = "High (> 0.75% - Good biological fertility)"

            source_label = "ISRIC SoilGrids 2.0 (250m Resolution) & ICAR Agro-Ecological Data"
            soil_name = f"{texture} ({'Alfisols / Red Soil' if soil_type == 'red' else 'Vertisols / Black Soil' if soil_type == 'black' else 'Inceptisols'})"

            drainage = "Well drained" if sand > 50 else "Moderately slow" if clay > 40 else "Moderately drained"
            suitable_crops = icar_profile.get("suitable_crops_hint") if icar_profile else "Broadly adaptable millets, pulses, and oilseeds."
            management_tips = icar_profile.get("management_tips") if icar_profile else "Incorporate organic matter to maintain topsoil structure."

        elif icar_profile:
            sand = icar_profile["sand_pct"]
            clay = icar_profile["clay_pct"]
            silt = icar_profile["silt_pct"]
            ph = icar_profile["ph"]
            ph_label = icar_profile["ph_label"]
            soc = icar_profile["organic_carbon_pct"]
            soc_label = icar_profile["organic_carbon_label"]
            texture = icar_profile["texture"]
            soil_type = icar_profile["soil_type"]
            soil_name = icar_profile["soil_name"]
            drainage = icar_profile["drainage"]
            suitable_crops = icar_profile["suitable_crops_hint"]
            management_tips = icar_profile["management_tips"]
            source_label = f"ICAR-NBSS&LUP Benchmark Soil Survey ({district.title() if district else 'Regional'})"

        else:
            # Regional lat/long heuristic for southern peninsular India
            if 10.0 <= latitude <= 16.0 and 75.0 <= longitude <= 79.0:
                sand = 58.0
                clay = 19.0
                silt = 23.0
                ph = 6.5
                ph_label = "Slightly Acidic to Neutral"
                soc = 0.50
                soc_label = "Medium (0.50%)"
                texture = "Sandy Loam"
                soil_type = "red"
                soil_name = "Red Sandy Loam (Southern Peninsular Alfisols)"
            elif 15.0 <= latitude <= 21.0 and 74.0 <= longitude <= 78.0:
                sand = 25.0
                clay = 45.0
                silt = 30.0
                ph = 7.9
                ph_label = "Moderately Alkaline"
                soc = 0.55
                soc_label = "Medium (0.55%)"
                texture = "Clay Loam"
                soil_type = "black"
                soil_name = "Deep Black Cotton Soil (Deccan Vertisols)"
            else:
                sand = 45.0
                clay = 25.0
                silt = 30.0
                ph = 7.0
                ph_label = "Neutral"
                soc = 0.50
                soc_label = "Medium (0.50%)"
                texture = "Loam"
                soil_type = "other"
                soil_name = "Mixed Loam (Alluvial / Inceptisols)"

            drainage = "Moderately well drained"
            suitable_crops = "Millets, pulses, oilseeds, and regional cereals."
            management_tips = "Maintain organic compost and practice seasonal mulching."
            source_label = "ICAR Agro-Ecological Sub-Region Reference Model"

        return {
            "soil_type": soil_type,
            "soil_name": soil_name,
            "texture": texture,
            "sand_pct": sand,
            "clay_pct": clay,
            "silt_pct": silt,
            "ph": ph,
            "ph_label": ph_label,
            "organic_carbon_pct": soc,
            "organic_carbon_label": soc_label,
            "drainage": drainage,
            "suitable_crops_hint": suitable_crops,
            "management_tips": management_tips,
            "data_source": source_label,
            "latitude": latitude,
            "longitude": longitude,
            "district": district or "Unknown",
            "state": state or "Unknown",
            "disclaimer": "Estimated result based on ISRIC SoilGrids & ICAR agro-ecological survey. Actual field conditions may vary. Not a laboratory soil test.",
            "is_estimated": True
        }
