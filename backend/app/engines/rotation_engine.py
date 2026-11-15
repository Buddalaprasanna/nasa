"""
rotation_engine.py - Multi-Season Crop Rotation Planning Engine.
Generates ecologically sound 3-season crop rotation plans (Kharif, Rabi, Summer/Zaid)
incorporating family alternation, biological nitrogen fixation, and water footprint reduction.
"""

from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger("field_shift.rotation_engine")

class CropRotationEngine:
    """
    Evaluates rotational sequencing to break weed and pathogen cycles,
    recharge root-zone nitrogen, and balance seasonal irrigation requirements.
    """

    def generate_rotation_plans(
        self,
        soil_type: str = "red",
        irrigation_type: str = "rainwater",
        previous_crop: str = "paddy",
        primary_goal: str = "improve_soil_health"
    ) -> List[Dict[str, Any]]:
        """
        Builds two tailored multi-season rotation plans comparing trade-offs.
        """
        soil = (soil_type or "red").lower()
        irrigation = (irrigation_type or "rainwater").lower()
        prev = (previous_crop or "paddy").lower()
        goal = (primary_goal or "improve_soil_health").lower()

        # Plan 1: Soil-Health and Water-Smart Legume Cycle
        plan_a_seasons = [
            {
                "season_number": 1,
                "season_name": {
                    "en": "Kharif (Monsoon Season)",
                    "kn": "ಮುಂಗಾರು (ಖಾರೀಫ್)",
                    "te": "ఖరీఫ్ (వర్షాకాలం)",
                    "ta": "காரிஃப் (மழைக்காலம்)",
                    "hi": "खरीफ (मानसून)"
                },
                "crop_id": "ragi",
                "crop_name": {
                    "en": "Finger Millet (Ragi)",
                    "kn": "ರಾಗಿ (ಫಿಂಗರ್ ಮಿಲೆಟ್)",
                    "te": "రాగులు (తైదలు)",
                    "ta": "கேழ்வரகு (ராகி)",
                    "hi": "रागी (मड़ुआ)"
                },
                "sowing_window": {
                    "en": "July - August",
                    "kn": "ಜುಲೈ - ಆಗಸ್ಟ್",
                    "te": "జూలై - ఆగస్టు",
                    "ta": "ஜூலை - ஆகஸ்ட்",
                    "hi": "जुलाई - अगस्त"
                },
                "harvest_window": {
                    "en": "October - November",
                    "kn": "ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್",
                    "te": "అక్టోబర్ - నవంబర్",
                    "ta": "அக்டோபர் - நவம்பர்",
                    "hi": "अक्टूबर - नवंबर"
                },
                "water_impact": {
                    "en": "Low (300-350 mm) - relies on monsoon rains",
                    "kn": "ಕಡಿಮೆ (300-350 ಮಿ.ಮೀ) - ಮಳೆ ನೀರಿನಿಂದಲೇ ಬೆಳೆಯುತ್ತದೆ",
                    "te": "తక్కువ (300-350 మి.మీ) - వర్షం పై ఆధారపడుతుంది",
                    "ta": "குறைவு (300-350 மிமீ) - மழைநீரில் வளரும்",
                    "hi": "कम (300-350 मिमी) - मानसूनी बारिश पर निर्भर"
                },
                "soil_health_benefit": {
                    "en": "Fibrous root mass prevents monsoon topsoil erosion and provides stable family food.",
                    "kn": "ದಟ್ಟವಾದ ಬೇರುಗಳು ಮಳೆಗಾಲದಲ್ಲಿ ಮಣ್ಣು ಕೊಚ್ಚಿ ಹೋಗುವುದನ್ನು ತಡೆದು ಆಹಾರ ಭದ್ರತೆ ನೀಡುತ್ತವೆ.",
                    "te": "పీచు వేర్లు పైనేల కొట్టుకుపోకుండా నిరోధిస్తాయి.",
                    "ta": "வேர்கள் மேல்மண் அரிப்பைத் தடுத்து உணவு பாதுகாப்பை உறுதி செய்கின்றன.",
                    "hi": "रेशेदार जड़ें मिट्टी का कटाव रोकती हैं और मुख्य खाद्यान्न देती हैं।"
                },
                "climate_suitability": {
                    "en": "Survives unpredictable monsoon dry spells up to 3 weeks.",
                    "kn": "3 ವಾರ ಮಳೆ ಕೈಕೊಟ್ಟರೂ ಬೆಳೆ ಹಾಳಾಗುವುದಿಲ್ಲ.",
                    "te": "3 వారాలు వర్షం లేకపోయినా పంట నిలుస్తుంది.",
                    "ta": "3 வாரங்கள் வரை மழை இல்லாவிட்டாலும் தாங்கும்.",
                    "hi": "3 सप्ताह तक बारिश न होने पर भी जीवित रहती है।"
                },
                "is_legume": False
            },
            {
                "season_number": 2,
                "season_name": {
                    "en": "Rabi (Winter Season)",
                    "kn": "ಹಿಂಗಾರು (ರಬಿ)",
                    "te": "రబీ (శీతాకాలం)",
                    "ta": "ரபி (குளிர்காலம்)",
                    "hi": "रबी (सर्दी)"
                },
                "crop_id": "redgram",
                "crop_name": {
                    "en": "Red Gram / Pigeon Pea (Tur)",
                    "kn": "ತೊಗರಿ (ರೆಡ್ ಗ್ರಾಂ)",
                    "te": "కందులు (తువర్)",
                    "ta": "துவரை (ரெட் கிராம்)",
                    "hi": "अरहर / तुअर दाल"
                },
                "sowing_window": {
                    "en": "November - December",
                    "kn": "ನವೆಂಬರ್ - ಡಿಸೆಂಬರ್",
                    "te": "నవంబర్ - డిసెంబర్",
                    "ta": "நவம்பர் - டிசம்பர்",
                    "hi": "नवंबर - दिसंबर"
                },
                "harvest_window": {
                    "en": "March - April",
                    "kn": "ಮಾರ್ಚ್ - ಏಪ್ರಿಲ್",
                    "te": "మార్చి - ఏప్రిల్",
                    "ta": "மார்ச் - ஏப்ரல்",
                    "hi": "मार्च - अप्रैल"
                },
                "water_impact": {
                    "en": "Low - deep taproot accesses residual subsoil moisture",
                    "kn": "ಕಡಿಮೆ - ಆಳವಾದ ಬೇರುಗಳು ಮಣ್ಣಿನ ಆಳದ ತೇವಾಂಶ ಬಳಸಿಕೊಳ್ಳುತ್ತವೆ",
                    "te": "తక్కువ - లోతైన వేర్లు భూమి తేమను తీసుకుంటాయి",
                    "ta": "குறைவு - ஆழமான வேர்கள் நிலத்தடி ஈரப்பதத்தை உறிஞ்சும்",
                    "hi": "कम - गहरी जड़ें निचली मिट्टी की नमी लेती हैं"
                },
                "soil_health_benefit": {
                    "en": "Fixes 40-50 kg atmospheric nitrogen per hectare through root nodules.",
                    "kn": "ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 40-50 ಕೆಜಿ ಸಾರಜನಕವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಸೇರಿಸುತ್ತದೆ.",
                    "te": "హెక్టారుకు 40-50 కిలోల నత్రజనిని నేలలో నిల్వ చేస్తుంది.",
                    "ta": "ஹெக்டேருக்கு 40-50 கிலோ தழைச்சத்தை மண்ணில் சேர்க்கிறது.",
                    "hi": "प्रति हेक्टेयर 40-50 किलो नाइट्रोजन मिट्टी में संचित करती है।"
                },
                "climate_suitability": {
                    "en": "Favorable cool winter nights support abundant flowering and pod set.",
                    "kn": "ಚಳಿಗಾಲದ ತಂಪಾದ ರಾತ್ರಿಗಳು ಉತ್ತಮ ಹೂವು ಮತ್ತು ಕಾಯಿ ಕಟ್ಟಲು ಸಹಕಾರಿ.",
                    "te": "శీతాకాలపు చలి పూత కాయకు ఎంతో అనుకూలం.",
                    "ta": "குளிர்கால தட்பவெப்பம் பூக்களுக்கு சிறந்தது.",
                    "hi": "सर्दी का अनुकूल तापमान फूल और फलियों के लिए उत्तम है।"
                },
                "is_legume": True
            },
            {
                "season_number": 3,
                "season_name": {
                    "en": "Summer (Pre-Monsoon Zaid)",
                    "kn": "ಬೇಸಿಗೆ (ಹಸಿರೆಲೆ ಗೊಬ್ಬರ)",
                    "te": "వేసవి (పచ్చిరొట్ట ఎరువు)",
                    "ta": "கோடை (பசுந்தாள் உரம்)",
                    "hi": "जायद / ग्रीष्म (हरी खाद)"
                },
                "crop_id": "sunnhemp",
                "crop_name": {
                    "en": "Sunnhemp / Cowpea (Green Manure)",
                    "kn": "ಸಣಬು / ಹುರುಳಿ (ಹಸಿರೆಲೆ ಗೊಬ್ಬರ)",
                    "te": "జనుము / అలసందలు (పచ్చిరొట్ట)",
                    "ta": "சணப்பை / தட்டப்பயறு (பசுந்தாள் உரம்)",
                    "hi": "सनई / लोबिया (हरी खाद)"
                },
                "sowing_window": {
                    "en": "April - May",
                    "kn": "ಏಪ್ರಿಲ್ - ಮೇ",
                    "te": "ఏప్రిల్ - మే",
                    "ta": "ஏப்ரல் - மே",
                    "hi": "अप्रैल - मई"
                },
                "harvest_window": {
                    "en": "June (Ploughed into soil at 45 days)",
                    "kn": "ಜೂನ್ (45 ದಿನಗಳಲ್ಲಿ ಭೂಮಿಯಲ್ಲಿ ಉಳುಮೆ)",
                    "te": "జూన్ (45 రోజుల్లో నేలలో కలియదున్నాలి)",
                    "ta": "ஜூன் (45 நாட்களில் நிலத்தில் மடக்கி உழ வேண்டும்)",
                    "hi": "जून (45 दिनों में खेत में जुताई कर मिलाएं)"
                },
                "water_impact": {
                    "en": "Minimal - establishes on pre-monsoon summer showers",
                    "kn": "ಅತಿ ಕಡಿಮೆ - ಮುಂಗಾರು ಮುನ್ನ ಬರುವ ಬೇಸಿಗೆ ಮಳೆಗೆ ಬೆಳೆಯುತ್ತದೆ",
                    "te": "చాలా తక్కువ - తొలకరి జల్లులతో పెరుగుతుంది",
                    "ta": "மிகக் குறைவு - கோடை மழையில் வளரும்",
                    "hi": "अति अल्प - गर्मियों की पहली फुहारों पर तैयार"
                },
                "soil_health_benefit": {
                    "en": "Adds 15-20 tonnes/ha fresh green organic matter, boosting soil water holding capacity.",
                    "kn": "ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 15-20 ಟನ್ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ನೀಡಿ ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ಇಂಗುವ ಶಕ್ತಿ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
                    "te": "హెక్టారుకు 15-20 టన్నుల సేంద్రీయ పదార్థాన్ని అందించి తేమ నిలిచేలా చేస్తుంది.",
                    "ta": "ஹெக்டேருக்கு 15-20 டன் வரை பசுந்தாள் உரம் அளித்து ஈரப்பதத்தை தக்கவைக்கிறது.",
                    "hi": "प्रति हेक्टेयर 15-20 टन जैविक पदार्थ देकर मिट्टी की नमी रोकने की शक्ति बढ़ाती है।"
                },
                "climate_suitability": {
                    "en": "Covers bare soil during scorching summer, preventing soil baking and nutrient volatilization.",
                    "kn": "ಬೇಸಿಗೆ ಬಿಸಿಲಿಗೆ ಭೂಮಿ ಒಣಗಿ ಪೋಷಕಾಂಶ ಆವಿಯಾಗುವುದನ್ನು ತಡೆಯುತ್ತದೆ.",
                    "te": "వేసవి ఎండల నుంచి నేలను కాపాడుతుంది.",
                    "ta": "கடும் வெயிலில் இருந்து நிலத்தைப் பாதுகாக்கிறது.",
                    "hi": "भीषण गर्मी में मिट्टी को ढककर पोषक तत्वों का उड़ना रोकती है।"
                },
                "is_legume": True
            }
        ]

        # Plan 2: High-Resilience Millet & Oilseed Cycle (Balanced Cash Flow)
        plan_b_seasons = [
            {
                "season_number": 1,
                "season_name": {
                    "en": "Kharif (Monsoon Season)",
                    "kn": "ಮುಂಗಾರು (ಖಾರೀಫ್)",
                    "te": "ఖరీఫ్ (వర్షాకాలం)",
                    "ta": "காரிஃப் (மழைக்காலம்)",
                    "hi": "खरीफ (मानसून)"
                },
                "crop_id": "groundnut",
                "crop_name": {
                    "en": "Groundnut (Peanut)",
                    "kn": "ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ",
                    "te": "వేరుశనగ (పల్లీ)",
                    "ta": "நிலக்கடலை (வேர்க்கடலை)",
                    "hi": "मूंगफली (पीनट)"
                },
                "sowing_window": {
                    "en": "June - July",
                    "kn": "ಜೂನ್ - ಜುಲೈ",
                    "te": "జూన్ - జూలై",
                    "ta": "ஜூன் - ஜூலை",
                    "hi": "जून - जुलाई"
                },
                "harvest_window": {
                    "en": "September - October",
                    "kn": "ಸೆಪ್ಟೆಂಬರ್ - ಅಕ್ಟೋಬರ್",
                    "te": "సెప్టెంబర్ - అక్టోబర్",
                    "ta": "செப்டம்பர் - அக்டோபர்",
                    "hi": "सितंबर - अक्टूबर"
                },
                "water_impact": {
                    "en": "Medium (400-450 mm) - productive use of monsoon rain",
                    "kn": "ಮಧ್ಯಮ (400-450 ಮಿ.ಮೀ) - ಮಳೆ ನೀರನ್ನು ಸಮರ್ಪಕವಾಗಿ ಬಳಸುತ್ತದೆ",
                    "te": "మధ్యస్థం (400-450 మి.మీ) - వర్షపు నీటి వినియోగం",
                    "ta": "மிதமானது (400-450 மிமீ) - மழைநீர் பயன்பாடு",
                    "hi": "मध्यम (400-450 मिमी) - मानसूनी जल का सदुपयोग"
                },
                "soil_health_benefit": {
                    "en": "Root nodules fix nitrogen and leaves drop dense organic litter.",
                    "kn": "ಬೇರುಗಳು ಸಾರಜನಕ ಉಳಿಸಿ ಸೊಪ್ಪು ಮಣ್ಣಿಗೆ ಸಾವಯವ ಗೊಬ್ಬರವಾಗುತ್ತದೆ.",
                    "te": "నత్రజనిని నిల్వ చేసి ఆకులు మంచి ఎరువుగా మారతాయి.",
                    "ta": "வேர்கள் தழைச்சத்தை கூட்டி இலைகள் உரமாகின்றன.",
                    "hi": "जड़ें नाइट्रोजन बनाती हैं और पत्तियां जैविक खाद बनती हैं।"
                },
                "climate_suitability": {
                    "en": "Provides dependable cash income before the winter season begins.",
                    "kn": "ಚಳಿಗಾಲ ಆರಂಭವಾಗುವ ಮೊದಲೇ ಕೈಗೆ ಉತ್ತಮ ನಗದು ಹಣ ತಂದುಕೊಡುತ್ತದೆ.",
                    "te": "శీతాకాలం మొదలయ్యే లోపే మంచి నగదు ఆదాయం ఇస్తుంది.",
                    "ta": "குளிர்காலத்திற்கு முன்பே நல்ல பண வருவாய் தரும்.",
                    "hi": "सर्दियों से पहले हाथ में अच्छी नकदी उपलब्ध कराती है।"
                },
                "is_legume": True
            },
            {
                "season_number": 2,
                "season_name": {
                    "en": "Rabi (Winter Season)",
                    "kn": "ಹಿಂಗಾರು (ರಬಿ)",
                    "te": "ರబీ (శీతాకాలం)",
                    "ta": "ரபி (குளிர்காலம்)",
                    "hi": "रबी (सर्दी)"
                },
                "crop_id": "ragi",
                "crop_name": {
                    "en": "Finger Millet (Ragi)",
                    "kn": "ರಾಗಿ (ಫಿಂಗರ್ ಮಿಲೆಟ್)",
                    "te": "రాగులు (తైదలు)",
                    "ta": "கேழ்வரகு (ராகி)",
                    "hi": "रागी (मड़ुआ)"
                },
                "sowing_window": {
                    "en": "October - November",
                    "kn": "ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್",
                    "te": "అక్టోబర్ - నవంబర్",
                    "ta": "அக்டோபர் - நவம்பர்",
                    "hi": "अक्टूबर - नवंबर"
                },
                "harvest_window": {
                    "en": "January - February",
                    "kn": "ಜನವರಿ - ಫೆಬ್ರವರಿ",
                    "te": "జనవరి - ఫిబ్రవరి",
                    "ta": "ஜனவரி - பிப்ரவரி",
                    "hi": "जनवरी - फरवरी"
                },
                "water_impact": {
                    "en": "Low (300 mm) - capitalizes on residual post-monsoon moisture",
                    "kn": "ಕಡಿಮೆ (300 ಮಿ.ಮೀ) - ಹಿಂಗಾರಿನ ತೇವಾಂಶದಲ್ಲೇ ಬೆಳೆಯುತ್ತದೆ",
                    "te": "తక్కువ (300 మి.మీ) - తేమతోనే పెరుగుతుంది",
                    "ta": "குறைவு (300 மிமீ) - எஞ்சிய ஈரப்பதத்தில் வளரும்",
                    "hi": "कम (300 मिमी) - बची हुई नमी पर तैयार"
                },
                "soil_health_benefit": {
                    "en": "Alternates family to Poaceae, preventing buildup of groundnut root pathogens.",
                    "kn": "ಶೇಂಗಾ ನಂತರ ಧಾನ್ಯ ಬೆಳೆಯುವುದರಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ರೋಗಾಣು ಹರಡುವುದು ನಿಲ್ಲುತ್ತದೆ.",
                    "te": "వేరుశనగ తెగుళ్లు అదుపులోకి వస్తాయి.",
                    "ta": "பயிர் குடும்பத்தை மாற்றுவதால் வேர் நோய்கள் குறையும்.",
                    "hi": "फसल चक्र बदलने से मूंगफली के मिट्टी जनित रोग रुकते हैं।"
                },
                "climate_suitability": {
                    "en": "Cool winter temperature prevents insect pest flare-ups.",
                    "kn": "ತಂಪಾದ ಹವಾಮಾನ ಕೀಟ ಬಾಧೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಹಕಾರಿ.",
                    "te": "చల్లని వాతావరణం వల్ల పురుగుల బెడద తక్కువ.",
                    "ta": "குளிர்ந்த காற்று பூச்சி தாக்குதலைக் குறைக்கும்.",
                    "hi": "ठंडा मौसम कीटों के प्रकोप को कम रखता है।"
                },
                "is_legume": False
            },
            {
                "season_number": 3,
                "season_name": {
                    "en": "Summer (Pre-Monsoon Zaid)",
                    "kn": "ಬೇಸಿಗೆ (ಹಿಂಗಾರು ಕಾಳು)",
                    "te": "వేసవి (పప్పుధాన్యం)",
                    "ta": "கோடை (பயறு)",
                    "hi": "जायद (दलहन)"
                },
                "crop_id": "greengram",
                "crop_name": {
                    "en": "Green Gram (Moong Dal)",
                    "kn": "ಹೆಸರು ಕಾಳು (ಮೂಂಗ್)",
                    "te": "పెసలు (మూంగ్)",
                    "ta": "பாசிப்பயறு (பச்சைப்பயறு)",
                    "hi": "मूंग दाल (हरा चना)"
                },
                "sowing_window": {
                    "en": "March - April",
                    "kn": "ಮಾರ್ಚ್ - ಏಪ್ರಿಲ್",
                    "te": "మార్చి - ఏప్రిల్",
                    "ta": "மார்ச் - ஏப்ரல்",
                    "hi": "मार्च - अप्रैल"
                },
                "harvest_window": {
                    "en": "May - June (Ready in 65 days)",
                    "kn": "ಮೇ - ಜೂನ್ (65 ದಿನಗಳಲ್ಲಿ ಕೊಯ್ಲು)",
                    "te": "మే - జూన్ (65 రోజుల్లో చేతికి)",
                    "ta": "மே - ஜூன் (65 நாட்களில் அறுவடை)",
                    "hi": "मई - जून (65 दिनों में तैयार)"
                },
                "water_impact": {
                    "en": "Low (200-250 mm) - 1 to 2 light irrigations sufficient",
                    "kn": "ಕಡಿಮೆ (200-250 ಮಿ.ಮೀ) - 1 ಅಥವಾ 2 ಲಘು ನೀರಾವರಿ ಸಾಕು",
                    "te": "తక్కువ (200-250 మి.మీ) - 1 లేదా 2 తడులు చాలు",
                    "ta": "குறைவு (200-250 மிமீ) - 1 அல்லது 2 பாசனங்களே போதும்",
                    "hi": "कम (200-250 मिमी) - 1 से 2 हल्की सिंचाई पर्याप्त"
                },
                "soil_health_benefit": {
                    "en": "Fast nitrogen recharge right before next year's Kharif sowing.",
                    "kn": "ಮುಂದಿನ ವರ್ಷದ ಮುಂಗಾರು ಬೆಳೆಗೆ ಭೂಮಿಯನ್ನು ಸಹಜವಾಗಿ ಸಜ್ಜುಗೊಳಿಸುತ್ತದೆ.",
                    "te": "వచ్చే ఖరీఫ్ కోసం భూమిని బలపరుస్తుంది.",
                    "ta": "அடுத்த காரிஃப் பருவத்திற்கு நிலத்தை தயார்ப்படுத்துகிறது.",
                    "hi": "अगली खरीफ के लिए जमीन को प्राकृतिक रूप से तैयार करती है।"
                },
                "climate_suitability": {
                    "en": "Heat-tolerant variety utilizes high solar radiation for fast grain filling.",
                    "kn": "ಬೇಸಿಗೆಯ ಬಿಸಿಲನ್ನು ಚೆನ್ನಾಗಿ ತಡೆದುಕೊಂಡು ಕಾಳು ಕಟ್ಟುತ್ತದೆ.",
                    "te": "ఎండను తట్టుకుని కాయ త్వరగా పడుతుంది.",
                    "ta": "வெயிலை தாங்கி விரைவாக மணி பிடிக்கிறது.",
                    "hi": "तेज धूप में भी आसानी से दाना भरती है।"
                },
                "is_legume": True
            }
        ]

        plan_a = {
            "plan_code": "plan_soil_builder",
            "title": {
                "en": "Plan A: Water-Smart Legume Cycle (Soil Rebuilding)",
                "kn": "ಯೋಜನೆ 1: ನೀರು ಉಳಿಸುವ ದ್ವಿದಳ ಧಾನ್ಯ ಚಕ್ರ (ಮಣ್ಣು ಸುಧಾರಣೆ)",
                "te": "ప్లాన్ 1: నీటి ఆదా పప్పుధాన్యాల చక్రం (భూసార పెంపు)",
                "ta": "திட்டம் 1: நீர் சேமிக்கும் பயறு சுழற்சி (மண் வள மீட்பு)",
                "hi": "योजना 1: पानी बचाने वाला दलहन चक्र (मिट्टी सुधार)"
            },
            "summary": {
                "en": "Finger Millet ➔ Red Gram ➔ Sunnhemp (Green Manure). Focuses on maximum soil rejuvenation and minimum water dependency.",
                "kn": "ರಾಗಿ ➔ ತೊಗರಿ ➔ ಸಣಬು (ಹಸಿರೆಲೆ ಗೊಬ್ಬರ). ಮಣ್ಣಿನ ಶಕ್ತಿ ವೃದ್ಧಿ ಮತ್ತು ನೀರು ಉಳಿತಾಯಕ್ಕೆ ಅತ್ಯುತ್ತಮ.",
                "te": "రాగులు ➔ కందులు ➔ జనుము (పచ్చిరొట్ట). భూసార రక్షణ మరియు నీటి ఆదాకు అనుకూలం.",
                "ta": "கேழ்வரகு ➔ துவரை ➔ சணப்பை. மண் வளம் பெருக்கவும் நீர் சேமிக்கவும் சிறந்தது.",
                "hi": "रागी ➔ अरहर ➔ सनई (हरी खाद)। मिट्टी की ताकत बढ़ाने और पानी बचाने के लिए सर्वश्रेष्ठ।"
            },
            "seasons": plan_a_seasons,
            "water_saving_summary": {
                "en": "Saves up to 40% irrigation water compared to cereal monoculture.",
                "kn": "ಸತತ ಧಾನ್ಯ ಬೆಳೆಯುವುದಕ್ಕಿಂತ ಶೇ 40 ರಷ್ಟು ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ.",
                "te": "సాధారణ పద్ధతి కంటే 40% సాగునీరు ఆదా అవుతుంది.",
                "ta": "வழக்கமான சாகுபடியை விட 40% பாசன நீர் மிச்சமாகும்.",
                "hi": "पारंपरिक खेती की तुलना में 40% सिंचाई जल की बचत।"
            },
            "soil_health_summary": {
                "en": "Adds 50 kg/ha biological nitrogen and adds up to 15 tonnes fresh green manure.",
                "kn": "ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 50 ಕೆಜಿ ನೈಸರ್ಗಿಕ ಸಾರಜನಕ ಮತ್ತು 15 ಟನ್ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ನೀಡುತ್ತದೆ.",
                "te": "హెక్టారుకు 50 కిలోల నత్రజని మరియు 15 టన్నుల పచ్చిరొట్టను అందిస్తుంది.",
                "ta": "ஹெக்டேருக்கு 50 கிலோ தழைச்சத்தும் 15 டன் இயற்கை உரமும் அளிக்கிறது.",
                "hi": "प्रति हेक्टेयर 50 किलो जैविक नाइट्रोजन और 15 टन हरी खाद देती है।"
            },
            "trade_offs": {
                "en": "Highest soil health improvement and lowest water risk; moderate immediate cash return in Season 3 due to green manuring.",
                "kn": "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ನೀರು ಉಳಿತಾಯದಲ್ಲಿ ಮುಂದು; 3ನೇ ಋತುವಿನಲ್ಲಿ ಬೆಳೆ ಮಣ್ಣಿಗೆ ಸೇರುವುದರಿಂದ ನಗದು ಆದಾಯ ಬದಲಿಗೆ ಮುಂದಿನ ಬೆಳೆಗೆ ಲಾಭ.",
                "te": "భూసారానికి శ్రేష్ఠం; మూడో సీజన్‌లో పచ్చిరొట్ట ఎరువు వల్ల తక్షణ నగదు కంటే దీర్ఘకాలిక లాభం ఎక్కువ.",
                "ta": "மண் வளத்திற்கு மிகச் சிறந்தது; 3ஆம் பருவத்தில் உடனடி பணத்தை விட அடுத்த பயிருக்கு உர பலன் அதிகம்.",
                "hi": "मिट्टी सुधार में अव्वल; तीसरे मौसम में हरी खाद के कारण तुरंत नकदी के बजाय अगली फसल में भारी लाभ।"
            },
            "is_saved": False
        }

        plan_b = {
            "plan_code": "plan_income_balance",
            "title": {
                "en": "Plan B: High-Resilience Millet & Oilseed Cycle (Income Balance)",
                "kn": "ಯೋಜನೆ 2: ಸಿರಿಧಾನ್ಯ ಮತ್ತು ಶೇಂಗಾ ಚಕ್ರ (ಸ್ಥಿರ ಆದಾಯ)",
                "te": "ప్లాన్ 2: చిరుధాన్యాలు మరియు వేరుశనగ చక్రం (ఆదాయ భద్రత)",
                "ta": "திட்டம் 2: சிறுதானியங்கள் மற்றும் எண்ணெய் வித்து சுழற்சி (வருமான சமநிலை)",
                "hi": "योजना 2: मोटा अनाज और तिलहन चक्र (आय संतुलन)"
            },
            "summary": {
                "en": "Groundnut ➔ Finger Millet ➔ Green Gram. Delivers balanced market returns every season while protecting soil structure.",
                "kn": "ಶೇಂಗಾ (ಕಡಲೆಕಾಯಿ) ➔ ರಾಗಿ ➔ ಹೆಸರು ಕಾಳು. ಪ್ರತಿ ಋತುವಿನಲ್ಲೂ ಮಾರುಕಟ್ಟೆ ಆದಾಯ ನೀಡುತ್ತಾ ಮಣ್ಣನ್ನು ಕಾಪಾಡುತ್ತದೆ.",
                "te": "వేరుశనగ ➔ రాగులు ➔ పెసలు. ప్రతి సీజన్ లోనూ చేతికి నగదు మరియు భూసార రక్షణ.",
                "ta": "நிலக்கடலை ➔ கேழ்வரகு ➔ பாசிப்பயறு. ஒவ்வொரு பருவத்திலும் நிலையான பண வருவாய் மற்றும் மண் பாதுகாப்பு.",
                "hi": "मूंगफली ➔ रागी ➔ मूंग। हर मौसम में बाजार से अच्छी नकदी और मिट्टी का संतुलन।"
            },
            "seasons": plan_b_seasons,
            "water_saving_summary": {
                "en": "Saves 25-30% water while maintaining multi-season market liquidity.",
                "kn": "ಶೇ 25-30 ರಷ್ಟು ನೀರು ಉಳಿಸುತ್ತಾ ವರ್ಷವಿಡೀ ಆದಾಯ ನೀಡುತ್ತದೆ.",
                "te": "25-30% నీటిని ఆదా చేస్తూ నిరంతర ఆదాయాన్ని అందిస్తుంది.",
                "ta": "25-30% நீர் சேமிப்புடன் ஆண்டு முழுவதும் பணப்புழக்கம் தரும்.",
                "hi": "25-30% पानी की बचत के साथ वर्ष भर नियमित नकद आमदनी।"
            },
            "soil_health_summary": {
                "en": "Two pulse crops in three seasons ensure continuous nitrogen fixation and root diversity.",
                "kn": "ಮೂರು ಋತುಗಳಲ್ಲಿ ಎರಡು ದ್ವಿದಳ ಬೆಳೆಗಳಿರುವುದರಿಂದ ಸಾರಜನಕ ಮತ್ತು ಬೇರುಗಳ ವೈವಿಧ್ಯತೆ ಕಾಪಾಡುತ್ತದೆ.",
                "te": "మూడు సీజన్లలో రెండు పప్పుధాన్యాల వల్ల నిరంతర నత్రజని అందుతుంది.",
                "ta": "மூன்று பருவங்களில் இரு பயறு வகைகள் தொடர்ந்து தழைச்சத்தை புதுப்பிக்கும்.",
                "hi": "तीन मौसमों में दो दलहनी फसलें मिट्टी में लगातार नाइट्रोजन भरती हैं।"
            },
            "trade_offs": {
                "en": "Higher cash income in all three seasons; requires slightly more attention to harvest timing and drying.",
                "kn": "ಮೂರು ಋತುಗಳಲ್ಲೂ ನಗದು ಆದಾಯ ಸಿಗುತ್ತದೆ; ಆದರೆ ಕೊಯ್ಲು ಮತ್ತು ಒಣಗಿಸುವಿಕೆಗೆ ಹೆಚ್ಚಿನ ಗಮನ ನೀಡಬೇಕು.",
                "te": "మూడు సీజన్లలోనూ మంచి నగదు వస్తుంది; కోత మరియు ఆరబెట్టడంలో జాగ్రత్త అవసరం.",
                "ta": "மூன்று பருவங்களிலும் நல்ல பண வரவு; ஆனால் அறுவடைக்கு சற்று கூடுதல் கவனம் தேவை.",
                "hi": "तीनों मौसमों में अच्छी नकद कमाई; कटाई और सुखाने में थोड़ी अतिरिक्त सावधानी आवश्यक।"
            },
            "is_saved": False
        }

        return [plan_a, plan_b]
