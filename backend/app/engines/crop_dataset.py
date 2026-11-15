"""
crop_dataset.py - Comprehensive agronomic dataset of major crops for Indian agro-climatic zones.
Includes multilingual names (English, Kannada, Telugu, Tamil, Hindi), soil compatibility,
water requirements, thermal thresholds, duration, family, and legume classification.
"""

from typing import List, Dict, Any

CROPS_DATASET: List[Dict[str, Any]] = [
    {
        "crop_id": "ragi",
        "name": {
            "en": "Finger Millet (Ragi)",
            "kn": "ರಾಗಿ (ಫಿಂಗರ್ ಮಿಲೆಟ್)",
            "te": "రాగులు (తైదలు)",
            "ta": "கேழ்வரகு (ராகி)",
            "hi": "रागी (मड़ुआ)"
        },
        "scientific_name": "Eleusine coracana",
        "family": "Poaceae (Grass / Millet)",
        "category": "Millet / Cereal",
        "is_legume": False,
        "water_req_level": "Low",
        "water_min_mm": 300.0,
        "water_max_mm": 450.0,
        "duration_days": "105 - 120 Days",
        "min_temp": 15.0,
        "max_temp": 38.0,
        "suitable_soils": ["red", "sandy", "black", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "canal", "drip", "other"],
        "sowing_season": {
            "en": "July to August (Kharif) / Dec to Jan (Rabi)",
            "kn": "ಜುಲೈ - ಆಗಸ್ಟ್ (ಮುಂಗಾರು) / ಡಿಸೆಂಬರ್ - ಜನವರಿ (ಹಿಂಗಾರು)",
            "te": "జూలై - ఆగస్టు (ఖరీఫ్) / డిసెంబర్ - జనవరి",
            "ta": "ஜூலை - ஆகஸ்ட் / டிசம்பர் - ஜனவரி",
            "hi": "जुलाई से अगस्त (खरीफ) / दिसंबर से जनवरी (रबी)"
        },
        "reasons": {
            "en": [
                "Highly drought resilient; survives dry spells up to 3 weeks.",
                "Thrives in low-fertility red and sandy soils.",
                "Requires 60% less water than traditional paddy.",
                "Stable local market value and high family nutritional security."
            ],
            "kn": [
                "ಬರ ನಿರೋಧಕ ಶಕ್ತಿ ಹೆಚ್ಚು; 3 ವಾರಗಳ ಕಾಲ ಮಳೆ ಇಲ್ಲದಿದ್ದರೂ ಬದುಕುತ್ತದೆ.",
                "ಕಡಿಮೆ ಫಲವತ್ತತೆ ಇರುವ ಕೆಂಪು ಮತ್ತು ಮರಳು ಮಣ್ಣಿನಲ್ಲಿಯೂ ಉತ್ತಮ ಇಳುವರಿ.",
                "ಭತ್ತಕ್ಕಿಂತ ಶೇಕಡಾ 60 ರಷ್ಟು ಕಡಿಮೆ ನೀರು ಸಾಕು.",
                "ಕ್ಯಾಲ್ಸಿಯಂ ಸಮೃದ್ಧ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿರಂತರ ಬೇಡಿಕೆ."
            ],
            "te": [
                "కరువును బాగా తట్టుకుంటుంది; 3 వారాల వరకు వర్షం లేకపోయినా నిలుస్తుంది.",
                "ఎర్ర మరియు ఇసుక నేలల్లో కూడా మంచి దిగుబడి వస్తుంది.",
                "వరితో పోలిస్తే 60% తక్కువ నీరు అవసరం.",
                "కాల్షియం ఎక్కువ మరియు స్థానిక మార్కెట్లో స్థిరమైన డిమాండ్."
            ],
            "ta": [
                "வறட்சியை தாங்கும் திறன் மிக்கது; 3 வாரங்கள் வரை மழை இல்லாவிட்டாலும் தாங்கும்.",
                "செம்மண் மற்றும் மணல் கலந்த நிலத்தில் எளிதாக வளரும்.",
                "நெல்லை விட 60% குறைவான நீரே போதும்.",
                "கால்சியம் சத்து நிறைந்தது மற்றும் நல்ல சந்தை வாய்ப்பு."
            ],
            "hi": [
                "सूखा सहन करने की उच्च क्षमता; 3 सप्ताह बिना बारिश के भी जीवित रहती है।",
                "कम उपजाऊ लाल और बलुई मिट्टी में भी अच्छी पैदावार।",
                "धान की तुलना में 60% कम पानी की आवश्यकता।",
                "कैल्शियम से भरपूर और स्थानीय बाजार में स्थिर मांग।"
            ]
        },
        "climate_risks": {
            "en": "Waterlogging at seedling stage; heavy rainfall during earhead harvest.",
            "kn": "ಸಸಿ ಹಂತದಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದು; ತೆನೆ ಬಲಿಯುವಾಗ ಭಾರಿ ಮಳೆ ಬಂದರೆ ತೊಂದರೆ.",
            "te": "మొలక దశలో నీరు నిలవడం; కోత సమయంలో భారీ వర్షాలు పడితే నష్టం.",
            "ta": "நாற்று பருவத்தில் நீர் தேங்குதல்; அறுவடை நேரத்தில் அதிக மழை பாதிக்கும்.",
            "hi": "अंकुरण के समय जलभराव; कटाई के समय अधिक बारिश से नुकसान।"
        },
        "soil_health_benefits": {
            "en": "Extensive fibrous root network binds topsoil and prevents monsoon erosion.",
            "kn": "ದಟ್ಟವಾದ ಬೇರುಗಳು ಮೇಲ್ಮಣ್ಣನ್ನು ಹಿಡಿದಿಟ್ಟು ಮಣ್ಣಿನ ಸವೆತವನ್ನು ತಡೆಯುತ್ತವೆ.",
            "te": "పీచు వేర్లు పైనేలను గట్టిగా పట్టి ఉంచి నేల కోతను నివారిస్తాయి.",
            "ta": "சல்லி வேர்கள் மேல்மண்ணை இறுகப் பிடித்து மண் அரிப்பைத் தடுக்கின்றன.",
            "hi": "घनी रेशेदार जड़ें ऊपरी मिट्टी को बांधकर कटाव रोकती हैं।"
        }
    },
    {
        "crop_id": "redgram",
        "name": {
            "en": "Red Gram / Pigeon Pea (Tur)",
            "kn": "ತೊಗರಿ (ರೆಡ್ ಗ್ರಾಂ)",
            "te": "కందులు (తువర్)",
            "ta": "துவரை (ரெட் கிராம்)",
            "hi": "अरहर / तुअर दाल"
        },
        "scientific_name": "Cajanus cajan",
        "family": "Fabaceae (Legume / Pulse)",
        "category": "Pulse / Legume",
        "is_legume": True,
        "water_req_level": "Low",
        "water_min_mm": 350.0,
        "water_max_mm": 550.0,
        "duration_days": "150 - 180 Days",
        "min_temp": 18.0,
        "max_temp": 38.0,
        "suitable_soils": ["red", "black", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "drip", "canal", "other"],
        "sowing_season": {
            "en": "June to July (Monsoon Onset)",
            "kn": "ಜೂನ್ - ಜುಲೈ (ಮುಂಗಾರು ಆರಂಭ)",
            "te": "జూన్ - జూలై (తొలకరి సమయం)",
            "ta": "ஜூன் - ஜூலை (ஆடிப் பட்டம்)",
            "hi": "जून से जुलाई (मानसून शुरुआत)"
        },
        "reasons": {
            "en": [
                "Naturally fixes 40-50 kg/ha atmospheric nitrogen in soil.",
                "Deep taproot breaks hard soil layers and accesses deep moisture.",
                "Ideal sequence crop after paddy or maize to restore fertility.",
                "Reduces synthetic fertilizer requirement for next crop by 25-30%."
            ],
            "kn": [
                "ವಾತಾವರಣದ ಸಾರಜನಕವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಹಿಡಿದಿಟ್ಟು ಭೂಮಿಯ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
                "ಆಳವಾದ ಬೇರುಗಳು ಗಟ್ಟಿ ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಆಳದ ತೇವಾಂಶ ಪಡೆಯುತ್ತವೆ.",
                "ಭತ್ತ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳದ ನಂತರ ಮಣ್ಣಿನ ಶಕ್ತಿ ಮರಳಿ ಪಡೆಯಲು ಅತ್ಯುತ್ತಮ.",
                "ಮುಂದಿನ ಬೆಳೆಗೆ ಯೂರಿಯಾ/ರಾಸಾಯನಿಕ ಗೊಬ್ಬರದ ಖರ್ಚು 25-30% ಉಳಿತಾಯವಾಗುತ್ತದೆ."
            ],
            "te": [
                "వాతావరణంలోని నత్రజనిని నేలలో స్థిరీకరించి భూసారాన్ని పెంచుతుంది.",
                "లోతైన వేర్లు భూమి లోపలి తేమను గ్రహించగలవు.",
                "వరి లేదా మొక్కజొన్న తర్వాత వేయడానికి ఉత్తమమైన పంట.",
                "తదుపరి పంటకు ఎరువుల ఖర్చు 25-30% తగ్గుతుంది."
            ],
            "ta": [
                "காற்றில் உள்ள தழைச்சத்தை மண்ணில் நிலைநிறுத்தி மண் வளத்தை கூட்டுகிறது.",
                "ஆழமான வேர்கள் நிலத்தின் அடியில் உள்ள ஈரப்பதத்தை உறிஞ்சும்.",
                "நெல் அல்லது மக்காச்சோளத்திற்கு பின் பயிர் செய்ய சிறந்தது.",
                "அடுத்த பயிருக்கான உரச்செலவை 25-30% வரை மிச்சப்படுத்துகிறது."
            ],
            "hi": [
                "हवा की नाइट्रोजन को मिट्टी में संचित कर उर्वरता बढ़ाती है।",
                "गहरी जड़ें कठोर मिट्टी को ढीला कर गहराई से नमी लेती हैं।",
                "धान या मक्का के बाद जमीन की ताकत लौटाने के लिए सर्वोत्तम।",
                "अगली फसल के लिए यूरिया व खाद का खर्च 25-30% कम करती है।"
            ]
        },
        "climate_risks": {
            "en": "Continuous cloudiness during flowering causes pod drop; sensitive to waterlogging.",
            "kn": "ಹೂವಾಡುವ ಸಮಯದಲ್ಲಿ ಸತತ ಮೋಡ ಕವಿದ ವಾತಾವರಣವಿದ್ದರೆ ಕಾಯಿ ಉದುರುವ ಸಾಧ್ಯತೆ.",
            "te": "పూత సమయంలో ఎడతెరిపిలేని మేఘాలు ఉంటే పూత రాలిపోతుంది.",
            "ta": "பூக்கும் தருணத்தில் தொடர் மேகமூட்டம் இருந்தால் பூ உதிர்தல் ஏற்படும்.",
            "hi": "फूल आते समय लगातार बादल छाए रहने से फूल झड़ने का खतरा।"
        },
        "soil_health_benefits": {
            "en": "Root nodules harbor Rhizobium bacteria that fix biological nitrogen and leaves add biomass.",
            "kn": "ಬೇರುಗಳಲ್ಲಿರುವ ಗಂಟುಗಳು ಸಾರಜನಕವನ್ನು ಸಂಗ್ರಹಿಸಿ ಮಣ್ಣಿಗೆ ನೈಸರ್ಗಿಕ ಪೋಷಕಾಂಶ ನೀಡುತ್ತವೆ.",
            "te": "వేర్లలోని బుడిపెలు నత్రజనిని నిల్వ చేసి నేలకు బలాన్నిస్తాయి.",
            "ta": "வேர் முடிச்சுகள் பாக்டீரியா மூலம் இயற்கையான தழைச்சத்தை அளிக்கின்றன.",
            "hi": "जड़ों की गांठें राइजोबियम से जैविक नाइट्रोजन संचित करती हैं।"
        }
    },
    {
        "crop_id": "groundnut",
        "name": {
            "en": "Groundnut / Peanut",
            "kn": "ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ",
            "te": "వేరుశనగ (పల్లీ)",
            "ta": "நிலக்கடலை (வேர்க்கடலை)",
            "hi": "मूंगफली (पीनट)"
        },
        "scientific_name": "Arachis hypogaea",
        "family": "Fabaceae (Legume / Oilseed)",
        "category": "Oilseed / Legume",
        "is_legume": True,
        "water_req_level": "Medium",
        "water_min_mm": 400.0,
        "water_max_mm": 600.0,
        "duration_days": "100 - 115 Days",
        "min_temp": 18.0,
        "max_temp": 35.0,
        "suitable_soils": ["red", "sandy", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "drip", "canal", "other"],
        "sowing_season": {
            "en": "June to July (Kharif) / Nov to Dec (Rabi)",
            "kn": "ಜೂನ್ - ಜುಲೈ (ಮುಂಗಾರು) / ನವೆಂಬರ್ - ಡಿಸೆಂಬರ್ (ಹಿಂಗಾರು)",
            "te": "జూన్ - జూలై / నవంబర్ - డిసెంబర్",
            "ta": "ஜூன் - ஜூலை / நவம்பர் - டிசம்பர்",
            "hi": "जून से जुलाई (खरीफ) / नवंबर से दिसंबर (रबी)"
        },
        "reasons": {
            "en": [
                "High market value cash crop suitable for sandy and red soils.",
                "Leaves and haulm provide nutritious green fodder for farm cattle.",
                "Enriches topsoil with organic matter and biological activity.",
                "Short turnaround time allows quick transition to next season."
            ],
            "kn": [
                "ಕೆಂಪು ಮತ್ತು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾದ ಉತ್ತಮ ವಾಣಿಜ್ಯ ಬೆಳೆ.",
                "ಶೇಂಗಾ ಸೊಪ್ಪು ರಾಸುಗಳಿಗೆ ಉತ್ತಮ ಪೌಷ್ಟಿಕ ಮೇವಾಗುತ್ತದೆ.",
                "ಮೇಲ್ಮಣ್ಣಿನಲ್ಲಿ ಸಾವಯವ ಅಂಶ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
                "ಕಡಿಮೆ ದಿನಗಳಲ್ಲಿ ಕೈಗೆ ಬರುವುದರಿಂದ ಮುಂದಿನ ಬೆಳೆಗೆ ಬೇಗ ಭೂಮಿ ಸಿದ್ಧವಾಗುತ್ತದೆ."
            ],
            "te": [
                "ఎర్ర మరియు ఇసుక నేలలకు సరిపోయే మంచి లాభదాయక పంట.",
                "వేరుశనగ ఆకులు పశువులకు బలమైన పోషక ఆహారంగా ఉపయోగపడతాయి.",
                "పైనేలలో సేంద్రీయ పదార్థాన్ని పెంచుతుంది.",
                "త్వరగా చేతికి రావడం వల్ల తర్వాతి పంటకు అనుకూలం."
            ],
            "ta": [
                "செம்மண் மற்றும் மணல் நிலங்களுக்கு ஏற்ற சிறந்த பணப்பயிர்.",
                "நிலக்கடலை கொடி கால்நடைகளுக்கு சத்தான தீவனமாக பயன்படுகிறது.",
                "மண்ணில் நுண்ணுயிர் பெருக்கத்தை அதிகரிக்கிறது.",
                "குறுகிய காலத்தில் அறுவடைக்கு வந்து அடுத்த பயிருக்கு வழிவகுக்கும்."
            ],
            "hi": [
                "लाल और बलुई मिट्टी के लिए उपयुक्त लाभकारी नकदी फसल।",
                "मूंगफली की पत्तियां मवेशियों के लिए पौष्टिक हरा चारा बनती हैं।",
                "मिट्टी में जैविक कार्बन और सूक्ष्मजीवों को बढ़ावा देती है।",
                "कम समय में पकने के कारण अगली फसल के लिए खेत जल्दी खाली।"
            ]
        },
        "climate_risks": {
            "en": "Severe moisture stress during peg penetration and pod filling stage.",
            "kn": "ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ತೀವ್ರ ತೇವಾಂಶದ ಕೊರತೆ ಉಂಟಾದರೆ ಕಾಯಿ ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.",
            "te": "ఊడలు దిగే సమయంలో మరియు కాయ ముదిరే దశలో నీటి ఎద్దడి రాకూడదు.",
            "ta": "விருது இறங்கும் போதும் காய் பிடிக்கும் போதும் நீர் பற்றாக்குறை ஆபத்தானது.",
            "hi": "सुइयां बनते समय और दाना भरते समय सूखे से पैदावार पर गंभीर असर।"
        },
        "soil_health_benefits": {
            "en": "Improves soil physical structure and leaves substantial biological nitrogen.",
            "kn": "ಮಣ್ಣಿನ ರಚನೆಯನ್ನು ಸಡಿಲಗೊಳಿಸಿ ನೈಸರ್ಗಿಕ ಸಾರಜನಕವನ್ನು ಬಿಟ್ಟುಹೋಗುತ್ತದೆ.",
            "te": "నేల గుల్లబారుతుంది మరియు నత్రజని నిల్వలు పెరుగుతాయి.",
            "ta": "மண்ணின் தன்மையை இலகுவாக்கி இயற்கையான தழைச்சத்தை சேர்க்கிறது.",
            "hi": "मिट्टी की संरचना सुधारती है और जैविक नाइट्रोजन छोड़ती है।"
        }
    },
    {
        "crop_id": "chickpea",
        "name": {
            "en": "Chickpea (Bengal Gram / Chana)",
            "kn": "ಕಡಲೆ (ಬೆಂಗಾಲ್ ಗ್ರಾಂ)",
            "te": "శనగలు (చనా)",
            "ta": "கொண்டைக்கடலை (சுண்டல்)",
            "hi": "चना (बंगाल ग्राम)"
        },
        "scientific_name": "Cicer arietinum",
        "family": "Fabaceae (Legume / Pulse)",
        "category": "Pulse / Legume",
        "is_legume": True,
        "water_req_level": "Low",
        "water_min_mm": 250.0,
        "water_max_mm": 400.0,
        "duration_days": "90 - 110 Days",
        "min_temp": 10.0,
        "max_temp": 32.0,
        "suitable_soils": ["black", "other", "red", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "drip", "canal", "other"],
        "sowing_season": {
            "en": "October to November (Rabi Season)",
            "kn": "ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್ (ಹಿಂಗಾರು)",
            "te": "అక్టోబర్ - నవంబర్ (రబీ కాలం)",
            "ta": "அக்டோபர் - நவம்பர் (குளிர்காலம்)",
            "hi": "अक्टूबर से नवंबर (रबी मौसम)"
        },
        "reasons": {
            "en": [
                "Utilizes residual soil moisture in deep black soils after monsoon.",
                "Low input cost and consistently high market demand.",
                "Improves soil nitrogen balance for next summer or kharif crop."
            ],
            "kn": [
                "ಮುಂಗಾರಿನ ನಂತರ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಉಳಿಯುವ ತೇವಾಂಶವನ್ನು ಚೆನ್ನಾಗಿ ಬಳಸಿಕೊಳ್ಳುತ್ತದೆ.",
                "ಕಡಿಮೆ ಖರ್ಚು, ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ಬೆಲೆ.",
                "ಮುಂದಿನ ಮುಂಗಾರು ಬೆಳೆಗೆ ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕ ಉಳಿಸುತ್ತದೆ."
            ],
            "te": [
                "ఖరీఫ్ తర్వాత నల్లరేగడి నేలలో మిగిలిన తేమతో సులభంగా పండుతుంది.",
                "తక్కువ పెట్టుబడి, మంచి మార్కెట్ ధర.",
                "తదుపరి పంటకు భూమిలో సారాన్ని పెంచుతుంది."
            ],
            "ta": [
                "மழைக்காலத்திற்கு பின் கரிசல் மண்ணில் உள்ள எஞ்சிய ஈரப்பதத்திலேயே வளரும்.",
                "குறைந்த செலவு மற்றும் நிலையான சந்தை மதிப்பு.",
                "அடுத்த பருவத்திற்கு மண்ணை வளப்படுத்துகிறது."
            ],
            "hi": [
                "मानसून के बाद काली मिट्टी में बची हुई नमी पर आसानी से तैयार।",
                "कम लागत और बाजार में साल भर अच्छी मांग।",
                "अगली खरीफ फसल के लिए मिट्टी में नाइट्रोजन संतुलन।"
            ]
        },
        "climate_risks": {
            "en": "High humidity promotes fungal blight; sensitive to unseasonal winter rain.",
            "kn": "ಹೆಚ್ಚು ತೇವಾಂಶ ಮತ್ತು ಚಳಿಗಾಲದ ಅಕಾಲಿಕ ಮಳೆಯಿಂದ ಬೂದಿ ರೋಗ ಬರುವ ಸಾಧ್ಯತೆ.",
            "te": "ఎక్కువ తేమ వల్ల బూడిద తెగులు వచ్చే అవకాశం ఉంది.",
            "ta": "அதிக காற்றில் ஈரப்பதம் மற்றும் பருவம் தவறிய மழை நோய்களை உருவாக்கும்.",
            "hi": "अधिक आर्द्रता और बेमौसम सर्दी की बारिश से उकठा व फफूंद रोग का खतरा।"
        },
        "soil_health_benefits": {
            "en": "Exudes organic acids from roots that solubilize fixed phosphorus in soil.",
            "kn": "ಬೇರುಗಳಿಂದ ಸ್ರವಿಸುವ ಆಮ್ಲಗಳು ಮಣ್ಣಿನಲ್ಲಿ ಸ್ಥಿರವಾಗಿರುವ ರಂಜಕವನ್ನು ಕರಗಿಸಿ ಗಿಡಗಳಿಗೆ ಲಭ್ಯವಾಗಿಸುತ್ತವೆ.",
            "te": "వేర్ల నుంచి వచ్చే ఆమ్లాలు నేలలోని భాస్వరాన్ని కరిగించి అందిస్తాయి.",
            "ta": "வேர் அமிலங்கள் மண்ணில் உள்ள மணிச்சத்தை பயிர்களுக்கு கிடைக்கச் செய்கின்றன.",
            "hi": "जड़ें कार्बनिक अम्ल छोड़ती हैं जो मिट्टी में जमे फास्फोरस को घुलनशील बनाती हैं।"
        }
    },
    {
        "crop_id": "maize",
        "name": {
            "en": "Maize / Corn",
            "kn": "ಮೆಕ್ಕೆಜೋಳ (ಕಾರ್ನ್)",
            "te": "మొక్కజొన్న",
            "ta": "மக்காச்சோளம்",
            "hi": "मक्का (भुट्टा)"
        },
        "scientific_name": "Zea mays",
        "family": "Poaceae (Grass / Cereal)",
        "category": "Cereal / Fodder",
        "is_legume": False,
        "water_req_level": "Medium",
        "water_min_mm": 500.0,
        "water_max_mm": 750.0,
        "duration_days": "95 - 110 Days",
        "min_temp": 18.0,
        "max_temp": 38.0,
        "suitable_soils": ["red", "black", "other", "dont_know"],
        "suitable_irrigation": ["borewell", "canal", "drip", "rainwater", "other"],
        "sowing_season": {
            "en": "June - July (Kharif) or Oct - Nov (Rabi)",
            "kn": "ಜೂನ್ - ಜುಲೈ ಅಥವಾ ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್",
            "te": "జూన్ - జూలై లేదా అక్టోబర్ - నవంబర్",
            "ta": "ஜூன் - ஜூலை அல்லது அக்டோபர் - நவம்பர்",
            "hi": "जून - जुलाई या अक्टूबर - नवंबर"
        },
        "reasons": {
            "en": [
                "Fast growing with high biomass production and quick income.",
                "Versatile crop for grain, poultry feed, and cattle silage.",
                "Fits well in dual-crop rotations with pulses."
            ],
            "kn": [
                "ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಮತ್ತು ಹೆಚ್ಚು ಮೇವು ನೀಡುವ ಬೆಳೆ.",
                "ಕೋಳಿ ಆಹಾರ ಮತ್ತು ದನಕರುಗಳ ಮೇವಿಗೆ ಸದಾ ಬೇಡಿಕೆ.",
                "ದ್ವಿದಳ ಧಾನ್ಯಗಳ ಜೊತೆ ಬೆಳೆ ಪರಿವರ್ತನೆಗೆ ಸೂಕ್ತ."
            ],
            "te": [
                "వేగంగా పెరుగుతుంది, మంచి దిగుబడి ఇస్తుంది.",
                "కోళ్ల దాణా మరియు పశుగ్రాసానికి మార్కెట్లో డిమాండ్.",
                "పప్పుధాన్యాలతో పంట మార్పిడికి అనుకూలం."
            ],
            "ta": [
                "வேகமாக வளரும், அதிக தீவன உற்பத்தி தரும்.",
                "கோழி தீவனம் மற்றும் கால்நடை உணவுக்கு நிலையான சந்தை.",
                "பயறு வகைகளுடன் பயிர் சுழற்சி செய்ய ஏற்றது."
            ],
            "hi": [
                "तेजी से बढ़ने वाली और भरपूर चारा देने वाली फसल।",
                "पोल्ट्री फीड और पशु आहार के लिए बाजार में भारी मांग।",
                "दलहनी फसलों के साथ फसल चक्र में फिट बैठती है।"
            ]
        },
        "climate_risks": {
            "en": "Drought stress during silking and pollination severely drops grain set.",
            "kn": "ತೆನೆ ಮೂಡುವಾಗ ನೀರು ಕಡಿಮೆಯಾದರೆ ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.",
            "te": "కంకి పాలు పోసుకునే సమయంలో నీరు అందకపోతే గింజలు సరిగా పడవు.",
            "ta": "பூத்து கதிர் வரும் போது தண்ணீர் தட்டுப்பாடு ஏற்பட்டால் மணி பிடிக்காது.",
            "hi": "मंजरी और दाना बनने की अवस्था में पानी की कमी से उत्पादन घटता है।"
        },
        "soil_health_benefits": {
            "en": "High stover residue contributes significant organic carbon when ploughed in.",
            "kn": "ಕಟಾವಿನ ನಂತರ ಉಳಿಯುವ ದಂಟುಗಳನ್ನು ಭೂಮಿಯಲ್ಲಿ ಉಳುಮೆ ಮಾಡಿದರೆ ಸಾವಯವ ಇಂಗಾಲ ಹೆಚ್ಚುತ್ತದೆ.",
            "te": "పంట అవశేషాలను భూమిలో దున్నడం వల్ల సేంద్రీయ కర్బనం పెరుగుతుంది.",
            "ta": "பயிர் கழிவுகளை நிலத்தில் உழுதால் கரிமச் சத்து கூடும்.",
            "hi": "फसल अवशेष मिट्टी में मिलाने से जैविक कार्बन की मात्रा बढ़ती है।"
        }
    },
    {
        "crop_id": "greengram",
        "name": {
            "en": "Green Gram (Moong Dal)",
            "kn": "ಹೆಸರು ಕಾಳು (ಮೂಂಗ್)",
            "te": "పెసలు (మూంగ్)",
            "ta": "பாசிப்பயறு (பச்சைப்பயறு)",
            "hi": "मूंग दाल (हरा चना)"
        },
        "scientific_name": "Vigna radiata",
        "family": "Fabaceae (Legume / Pulse)",
        "category": "Pulse / Legume",
        "is_legume": True,
        "water_req_level": "Low",
        "water_min_mm": 250.0,
        "water_max_mm": 400.0,
        "duration_days": "65 - 75 Days",
        "min_temp": 20.0,
        "max_temp": 40.0,
        "suitable_soils": ["red", "black", "sandy", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "drip", "canal", "other"],
        "sowing_season": {
            "en": "June - July (Kharif) or March - April (Summer/Zaid)",
            "kn": "ಜೂನ್ - ಜುಲೈ ಅಥವಾ ಮಾರ್ಚ್ - ಏಪ್ರಿಲ್ (ಬೇಸಿಗೆ)",
            "te": "జూన్ - జూలై లేదా మార్చి - ఏప్రిల్ (వేసవి)",
            "ta": "ஜூன் - ஜூலை அல்லது மார்ச் - ஏப்ரல் (கோடை)",
            "hi": "जून - जुलाई या मार्च - अप्रैल (जायद)"
        },
        "reasons": {
            "en": [
                "Ultra-short duration (65-75 days); ideal catch-crop between main seasons.",
                "Enriches soil with atmospheric nitrogen quickly.",
                "Low water consumption and high nutritional/market value."
            ],
            "kn": [
                "ಅತೀ ಕಡಿಮೆ ಅವಧಿಯ ಬೆಳೆ (65-75 ದಿನಗಳು); ಎರಡು ಮುಖ್ಯ ಬೆಳೆಗಳ ನಡುವೆ ಸುಲಭವಾಗಿ ಬೆಳೆಯಬಹುದು.",
                "ಅತಿ ವೇಗವಾಗಿ ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
                "ಕಡಿಮೆ ನೀರಿನ ಬಳಕೆ ಮತ್ತು ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ."
            ],
            "te": [
                "చాలా తక్కువ కాలపరిమితి (65-75 రోజులు); రెండు ప్రధాన పంటల మధ్య సులభంగా వేయవచ్చు.",
                "త్వరితంగా భూమిలో నత్రజనిని నిల్వ చేస్తుంది.",
                "తక్కువ నీరు మరియు మంచి లాభం."
            ],
            "ta": [
                "மிகக் குறுகிய காலப்பயிர் (65-75 நாட்கள்); இரு முக்கிய பருவங்களுக்கு இடையில் பயிரிட சிறந்தது.",
                "மண்ணில் விரைவாக தழைச்சத்தை கூட்டுகிறது.",
                "குறைந்த நீர் பயன்பாடு மற்றும் நல்ல சத்து மதிப்பு."
            ],
            "hi": [
                "अति अल्पकालीन फसल (65-75 दिन); दो मुख्य फसलों के बीच आसानी से लगाएं।",
                "तेजी से मिट्टी में नाइट्रोजन संचित कर उपजाऊ बनाती है।",
                "कम पानी की खपत और पौष्टिक व लाभकारी उत्पाद।"
            ]
        },
        "climate_risks": {
            "en": "Excess rain during pod maturation causes seed sprouting in pods.",
            "kn": "ಕಾಯಿ ಬಲಿಯುವಾಗ ಅತಿಯಾದ ಮಳೆ ಬಂದರೆ ಕಾಯಿಯಲ್ಲೇ ಮೊಳಕೆ ಬರುವ ಸಾಧ್ಯತೆ.",
            "te": "కాయ ముదిరే సమయంలో ఎక్కువ వర్షం పడితే కాయలోనే మొలకలు వస్తాయి.",
            "ta": "காய் முதிரும் போது அதிக மழை பெய்தால் காயிலேயே முளைக்கக்கூடும்.",
            "hi": "फली पकते समय अधिक बारिश होने पर फलियों में ही दाने अंकुरित होने का खतरा।"
        },
        "soil_health_benefits": {
            "en": "Rapid nitrogen fixation and abundant tender green biomass for quick decomposition.",
            "kn": "ವೇಗದ ಸಾರಜನಕ ಸ್ಥಿರೀಕರಣ ಮತ್ತು ಮಣ್ಣಿಗೆ ಮೃದುವಾದ ಹಸಿರು ಗೊಬ್ಬರ ಒದಗಿಸುತ್ತದೆ.",
            "te": "త్వరిత నత్రజని స్థిరీకరణ మరియు లేత పచ్చిరొట్ట ఎరువును అందిస్తుంది.",
            "ta": "விரைவான தழைச்சத்து சேர்க்கை மற்றும் மென்மையான பசுந்தாள் உரமாகிறது.",
            "hi": "तेज नाइट्रोजन स्थिरीकरण और कोमल हरी खाद जो जल्दी सड़ती है।"
        }
    },
    {
        "crop_id": "sorghum",
        "name": {
            "en": "Sorghum (Jowar / Great Millet)",
            "kn": "ಜೋಳ (ಜೋವರ್)",
            "te": "జొన్నలు",
            "ta": "சோளம் (ஜோவர்)",
            "hi": "ज्वार (सोरघम)"
        },
        "scientific_name": "Sorghum bicolor",
        "family": "Poaceae (Grass / Millet)",
        "category": "Millet / Cereal",
        "is_legume": False,
        "water_req_level": "Low",
        "water_min_mm": 350.0,
        "water_max_mm": 500.0,
        "duration_days": "100 - 115 Days",
        "min_temp": 16.0,
        "max_temp": 40.0,
        "suitable_soils": ["black", "red", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "canal", "other"],
        "sowing_season": {
            "en": "July (Kharif) or October (Rabi)",
            "kn": "ಜುಲೈ (ಮುಂಗಾರು) ಅಥವಾ ಅಕ್ಟೋಬರ್ (ಹಿಂಗಾರು)",
            "te": "జూలై లేదా అక్టోబర్",
            "ta": "ஜூலை அல்லது அக்டோபர்",
            "hi": "जुलाई (खरीफ) या अक्टूबर (रबी)"
        },
        "reasons": {
            "en": [
                "Exceptional drought and heat tolerance; goes dormant during dry spells.",
                "Produces both nutritious grain for food and sweet stalk for livestock fodder.",
                "Deep root system extracts moisture and residual nutrients from black soils."
            ],
            "kn": [
                "ಅಸಾಧಾರಣ ಬರ ಮತ್ತು ಬಿಸಿಲು ಸಹಿಷ್ಣುತೆ; ಮಳೆ ಇಲ್ಲದಿದ್ದಾಗಲೂ ಹಸಿರಾಗಿ ಉಳಿಯುತ್ತದೆ.",
                "ಆಹಾರ ಧಾನ್ಯ ಹಾಗೂ ದನಕರುಗಳಿಗೆ ಶ್ರೇಷ್ಠ ಪೌಷ್ಟಿಕ ಮೇವು ಎರಡನ್ನೂ ನೀಡುತ್ತದೆ.",
                "ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಆಳದ ತೇವಾಂಶ ಮತ್ತು ಪೋಷಕಾಂಶಗಳನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತದೆ."
            ],
            "te": [
                "కరువును మరియు అధిక ఎండను తట్టుకునే అద్భుతమైన శక్తి.",
                "ధాన్యంతో పాటు పశువులకు శ్రేష్ఠమైన మేతను ఇస్తుంది.",
                "నల్లరేగడి నేలలోని లోతైన తేమను చక్కగా గ్రహిస్తుంది."
            ],
            "ta": [
                "வறட்சியையும் கடுமையான வெயிலையும் தாங்கும் ஆற்றல் கொண்டது.",
                "உணவு தானியத்துடன் கால்நடைகளுக்கு சிறந்த சத்துள்ள தீவனம் அளிக்கிறது.",
                "கரிசல் மண்ணின் அடியில் உள்ள ஈரப்பதத்தை உறிஞ்சி வளரும்."
            ],
            "hi": [
                "सूखा और तेज गर्मी सहने की असाधारण क्षमता।",
                "अनाज के साथ-साथ पशुओं के लिए पौष्टिक मीठा चारा भी उपलब्ध कराती है।",
                "काली मिट्टी में गहराई से नमी और बचे हुए पोषक तत्व ग्रहण करती है।"
            ]
        },
        "climate_risks": {
            "en": "Heavy post-heading rain stains grain and risks earhead mold.",
            "kn": "ತೆನೆ ಮೂಡಿದ ನಂತರ ಭಾರಿ ಮಳೆ ಬಂದರೆ ಕಾಳು ಕಪ್ಪಾಗುವ ಮತ್ತು ಬೂಸ್ಟು ಹಿಡಿಯುವ ಅಪಾಯ.",
            "te": "కంకి వచ్చిన తర్వాత భారీ వర్షం పడితే గింజ రంగు మారుతుంది.",
            "ta": "கதிர் வந்த பின் பெய்யும் கனமழை தானியத்தை கறுத்து பூஞ்சை பிடிக்கச் செய்யும்.",
            "hi": "सिट्टा बनने के बाद भारी बारिश से दानों पर फफूंद लगने का खतरा।"
        },
        "soil_health_benefits": {
            "en": "Extensive root channels improve deep soil percolation and soil porosity.",
            "kn": "ಆಳವಾದ ಬೇರುಗಳು ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಮಳೆ ನೀರು ಆಳಕ್ಕೆ ಇಂಗಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.",
            "te": "లోతైన వేర్లు నేలలో నీటి ఇంకుడును పెంచుతాయి.",
            "ta": "ஆழமான வேர் அமைப்புகள் மழைநீர் பூமிக்குள் எளிதில் இறங்க உதவுகின்றன.",
            "hi": "गहरी जड़ें मिट्टी की जल अवशोषण क्षमता और वायु संचार बढ़ाती हैं।"
        }
    },
    {
        "crop_id": "sunnhemp",
        "name": {
            "en": "Sunnhemp / Cowpea (Green Manure)",
            "kn": "ಸಣಬು / ಹುರುಳಿ (ಹಸಿರೆಲೆ ಗೊಬ್ಬರ)",
            "te": "జనుము / అలసందలు (పచ్చిరొట్ట ఎరువు)",
            "ta": "சணப்பை / தட்டப்பயறு (பசுந்தாள் உரம்)",
            "hi": "सनई / लोबिया (हरी खाद)"
        },
        "scientific_name": "Crotalaria juncea",
        "family": "Fabaceae (Legume / Soil Builder)",
        "category": "Green Manure / Cover Crop",
        "is_legume": True,
        "water_req_level": "Low",
        "water_min_mm": 200.0,
        "water_max_mm": 350.0,
        "duration_days": "45 - 60 Days",
        "min_temp": 18.0,
        "max_temp": 42.0,
        "suitable_soils": ["red", "sandy", "black", "other", "dont_know"],
        "suitable_irrigation": ["rainwater", "borewell", "drip", "canal", "other"],
        "sowing_season": {
            "en": "April to June (Pre-Monsoon Summer)",
            "kn": "ಏಪ್ರಿಲ್ - ಜೂನ್ (ಮುಂಗಾರು ಪೂರ್ವ ಬೇಸಿಗೆ)",
            "te": "ఏప్రిల్ - జూన్ (తొలకరి ముందు)",
            "ta": "ஏப்ரல் - ஜூன் (கோடை பருவம்)",
            "hi": "अप्रैल से जून (ग्रीष्म पूर्व मानसून)"
        },
        "reasons": {
            "en": [
                "Ploughed directly into soil to add 80-100 kg organic nitrogen per hectare.",
                "Suppresses aggressive summer weeds naturally without herbicides.",
                "Multiplies beneficial earthworms and soil moisture-holding capacity."
            ],
            "kn": [
                "ಭೂಮಿಯಲ್ಲಿ ಉಳುಮೆ ಮಾಡುವುದರಿಂದ ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 80-100 ಕೆಜಿ ಸಾವಯವ ಸಾರಜನಕ ಸಿಗುತ್ತದೆ.",
                "ಕಳೆನಾಶಕಗಳಿಲ್ಲದೆ ಬೇಸಿಗೆಯ ಕಳೆಯನ್ನು ಸ್ವಾಭಾವಿಕವಾಗಿ ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
                "ಮಣ್ಣಿನಲ್ಲಿ ಎರೆಹುಳುಗಳನ್ನು ಹೆಚ್ಚಿಸಿ ತೇವಾಂಶ ಹಿಡಿದಿಡುವ ಶಕ್ತಿಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸುತ್ತದೆ."
            ],
            "te": [
                "నేలలో కలియదున్నడం వల్ల హెక్టారుకు 80-100 కిలోల సేంద్రీయ నత్రజని లభిస్తుంది.",
                "కలుపు మొక్కలను సహజంగా నివారిస్తుంది.",
                "వానపాముల సంఖ్యను పెంచి నేలలో తేమ నిలిచేలా చేస్తుంది."
            ],
            "ta": [
                "மண்ணோடு சேர்த்து உழுவதால் ஹெக்டேருக்கு 80-100 கிலோ இயற்கை தழைச்சத்து கிடைக்கிறது.",
                "களைகளை இயற்கையாகவே கட்டுப்படுத்துகிறது.",
                "மண்புழுக்களை பெருக்கி ஈரப்பதத்தை தக்கவைக்கிறது."
            ],
            "hi": [
                "खेत में पलटने से प्रति हेक्टेयर 80-100 किलोग्राम जैविक नाइट्रोजन मिलती है।",
                "खरपतवार को बिना रसायन के प्राकृतिक रूप से दबाती है।",
                "केंचुओं की संख्या बढ़ाकर मिट्टी की जल धारण क्षमता दोगुना करती है।"
            ]
        },
        "climate_risks": {
            "en": "Must be incorporated before seed hardening; needs single shower for germination.",
            "kn": "ಬೀಜ ಗಟ್ಟಿಯಾಗುವ ಮುನ್ನವೇ (ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ) ಉಳುಮೆ ಮಾಡಬೇಕು; ಮೊಳಕೆಗೆ ಒಂದು ಮಳೆ ಸಾಕು.",
            "te": "పూత దశలోనే భూమిలో దున్నాలి; మొలకెత్తడానికి ఒక తేలికపాటి వర్షం చాలు.",
            "ta": "பூக்கும் தருணத்திலேயே நிலத்தில் மடக்கி உழ வேண்டும்.",
            "hi": "फूल आने के समय ही खेत में जुताई कर मिलाना जरूरी है।"
        },
        "soil_health_benefits": {
            "en": "Premier soil rebuilder: produces up to 20 tonnes/ha fresh green organic matter.",
            "kn": "ಮಣ್ಣಿನ ನವಚೈತನ್ಯ: ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 20 ಟನ್‌ವರೆಗೆ ತಾಜಾ ಹಸಿರೆಲೆ ಜೈವಿಕ ಗೊಬ್ಬರ ನೀಡುತ್ತದೆ.",
            "te": "భూసార పెంపుదల: హెక్టారుకు 20 టన్నుల వరకు పచ్చిరొట్టను అందిస్తుంది.",
            "ta": "மண் வள மீட்பு: ஹெக்டேருக்கு 20 டன் வரை பசுந்தாள் உரம் தருகிறது.",
            "hi": "सर्वश्रेष्ठ मृदा सुधारक: प्रति हेक्टेयर 20 टन तक ताजा जैविक पदार्थ देती है।"
        }
    }
]
