// data.js - Agricultural, NASA Earth Observation, Crop Rotation, Alerts and Calendar Datasets

export const cropsData = [
  {
    id: "ragi",
    name: {
      en: "Finger Millet (Ragi)",
      kn: "ರಾಗಿ (ಫಿಂಗರ್ ಮಿಲೆಟ್)",
      te: "రాగులు (తైదలు)",
      ta: "கேழ்வரகு (ராகி)",
      hi: "रागी (मड़ुआ)"
    },
    scientificName: "Eleusine coracana",
    category: "Millet / Cereal",
    suitability: "suitabilityHigh",
    waterReq: "waterReqLow",
    waterScore: 1, // 1: Low, 2: Med, 3: High
    idealSoil: ["red", "sandy", "black"],
    duration: "105 - 120 Days",
    sowingWindow: {
      en: "July to August (Kharif) / Dec to Jan (Rabi)",
      kn: "ಜುಲೈ - ಆಗಸ್ಟ್ (ಮುಂಗಾರು) / ಡಿಸೆಂಬರ್ - ಜನವರಿ",
      te: "జూలై - ఆగస్టు (ఖరీఫ్) / డిసెంబర్ - జనవరి",
      ta: "ஜூலை - ஆகஸ்ட் / டிசம்பர் - ஜனவரி",
      hi: "जुलाई से अगस्त (खरीफ) / दिसंबर से जनवरी"
    },
    whyRecommended: {
      en: [
        "Highly drought resilient; survives dry spells up to 3 weeks.",
        "Grows well in low-fertility red and sandy soils.",
        "Requires 60% less water than paddy.",
        "Rich in calcium and stable local market demand."
      ],
      kn: [
        "ಬರ ನಿರೋಧಕ ಶಕ್ತಿ ಹೆಚ್ಚು; 3 ವಾರಗಳ ಕಾಲ ಮಳೆ ಇಲ್ಲದಿದ್ದರೂ ಬದುಕುತ್ತದೆ.",
        "ಕಡಿಮೆ ಫಲವತ್ತತೆ ಇರುವ ಕೆಂಪು ಮತ್ತು ಮರಳು ಮಣ್ಣಿನಲ್ಲಿಯೂ ಉತ್ತಮ ಇಳುವರಿ.",
        "ಭತ್ತಕ್ಕಿಂತ ಶೇಕಡಾ 60 ರಷ್ಟು ಕಡಿಮೆ ನೀರು ಸಾಕು.",
        "ಕ್ಯಾಲ್ಸಿಯಂ ಸಮೃದ್ಧ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿರಂತರ ಬೇಡಿಕೆ."
      ],
      te: [
        "కరువును బాగా తట్టుకుంటుంది; 3 వారాల వరకు వర్షం లేకపోయినా నిలుస్తుంది.",
        "ఎర్ర మరియు ఇసుక నేలల్లో కూడా మంచి దిగుబడి వస్తుంది.",
        "వరితో పోలిస్తే 60% తక్కువ నీరు అవసరం.",
        "కాల్షియం ఎక్కువ మరియు స్థానిక మార్కెట్లో స్థిరమైన డిమాండ్."
      ],
      ta: [
        "வறட்சியை தாங்கும் திறன் மிக்கது; 3 வாரங்கள் வரை மழை இல்லாவிட்டாலும் தாங்கும்.",
        "செம்மண் மற்றும் மணல் கலந்த நிலத்தில் எளிதாக வளரும்.",
        "நெல்லை விட 60% குறைவான நீரே போதும்.",
        "கால்சியம் சத்து நிறைந்தது மற்றும் நல்ல சந்தை வாய்ப்பு."
      ],
      hi: [
        "सूखा सहन करने की उच्च क्षमता; 3 सप्ताह बिना बारिश के भी जीवित रहती है।",
        "कम उपजाऊ लाल और बलुई मिट्टी में भी अच्छी पैदावार।",
        "धान की तुलना में 60% कम पानी की आवश्यकता।",
        "कैल्शियम से भरपूर और स्थानीय बाजार में स्थिर मांग।"
      ]
    },
    climateRisks: {
      en: "Waterlogging at seedling stage; heavy rainfall during earhead harvest.",
      kn: "ಸಸಿ ಹಂತದಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದು; ತೆನೆ ಬಲಿಯುವಾಗ ಭಾರಿ ಮಳೆ ಬಂದರೆ ತೊಂದರೆ.",
      te: "మొలక దశలో నీరు నిలవడం; కోత సమయంలో భారీ వర్షాలు పడితే నష్టం.",
      ta: "நாற்று பருவத்தில் நீர் தேங்குதல்; அறுவடை நேரத்தில் அதிக மழை பாதிக்கும்.",
      hi: "अंकुरण के समय जलभराव; कटाई के समय अधिक बारिश से नुकसान।"
    },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    badgeIcon: "🌾"
  },
  {
    id: "redgram",
    name: {
      en: "Red Gram / Pigeon Pea (Tur)",
      kn: "ತೊಗರಿ (ರೆಡ್ ಗ್ರಾಂ)",
      te: "కందులు (తువర్)",
      ta: "துவரை (ரெட் கிராம்)",
      hi: "अरहर / तुअर दाल"
    },
    scientificName: "Cajanus cajan",
    category: "Legume / Pulse",
    suitability: "suitabilityHigh",
    waterReq: "waterReqLow",
    waterScore: 1,
    idealSoil: ["black", "red", "other"],
    duration: "150 - 180 Days",
    sowingWindow: {
      en: "June to July (Monsoon Onset)",
      kn: "ಜೂನ್ - ಜುಲೈ (ಮುಂಗಾರು ಆರಂಭ)",
      te: "జూన్ - జూలై (తొలకరి సమయం)",
      ta: "ஜூன் - ஜூலை (ஆடிப் பட்டம்)",
      hi: "जून से जुलाई (मानसून शुरुआत)"
    },
    whyRecommended: {
      en: [
        "Naturally fixes atmospheric nitrogen, improving soil fertility for next crop.",
        "Deep taproot breaks hard soil layers and accesses deep soil moisture.",
        "Excellent intercrop with millets or groundnut.",
        "Reduces synthetic fertilizer requirement by 25-30%."
      ],
      kn: [
        "ವಾತಾವರಣದ ಸಾರಜನಕವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಹಿಡಿದಿಟ್ಟು ಭೂಮಿಯ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
        "ಆಳವಾದ ಬೇರುಗಳು ಗಟ್ಟಿ ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಆಳದ ತೇವಾಂಶ ಪಡೆಯುತ್ತವೆ.",
        "ರಾಗಿ ಅಥವಾ ಶೇಂಗಾ ಜೊತೆ ಅತ್ಯುತ್ತಮ ಮಿಶ್ರಬೆಳೆ.",
        "ಮುಂದಿನ ಬೆಳೆಗೆ ಯೂರಿಯಾ/ರಾಸಾಯನಿಕ ಗೊಬ್ಬರದ ಖರ್ಚು 25-30% ಉಳಿತಾಯವಾಗುತ್ತದೆ."
      ],
      te: [
        "వాతావరణంలోని నత్రజనిని నేలలో స్థిరీకరించి భూసారాన్ని పెంచుతుంది.",
        "లోతైన వేర్లు భూమి లోపలి తేమను గ్రహించగలవు.",
        "రాగులు లేదా వేరుశనగతో కలిపి అంతరపంటగా వేయవచ్చు.",
        "తదుపరి పంటకు ఎరువుల ఖర్చు 25-30% తగ్గుతుంది."
      ],
      ta: [
        "காற்றில் உள்ள தழைச்சத்தை மண்ணில் நிலைநிறுத்தி மண் வளத்தை கூட்டுகிறது.",
        "ஆழமான வேர்கள் நிலத்தின் அடியில் உள்ள ஈரப்பதத்தை உறிஞ்சும்.",
        "கேழ்வரகு அல்லது நிலக்கடலையுடன் சிறந்த ஊடுபயிர்.",
        "அடுத்த பயிருக்கான உரச்செலவை 25-30% வரை மிச்சப்படுத்துகிறது."
      ],
      hi: [
        "हवा की नाइट्रोजन को मिट्टी में संचित कर उर्वरता बढ़ाती है।",
        "गहरी जड़ें कठोर मिट्टी को ढीला कर गहराई से नमी लेती हैं।",
        "मोटे अनाज या मूंगफली के साथ बेहतरीन अंतःफसल (Intercrop)।",
        "अगली फसल के लिए यूरिया व खाद का खर्च 25-30% कम करती है।"
      ]
    },
    climateRisks: {
      en: "Continuous cloudiness during flowering causes pod drop; sensitive to frost.",
      kn: "ಹೂವಾಡುವ ಸಮಯದಲ್ಲಿ ಸತತ ಮೋಡ ಕವಿದ ವಾತಾವರಣವಿದ್ದರೆ ಕಾಯಿ ಉದುರುವ ಸಾಧ್ಯತೆ.",
      te: "పూత సమయంలో ఎడతెరిపిలేని మేఘాలు ఉంటే పూత రాలిపోతుంది.",
      ta: "பூக்கும் தருணத்தில் தொடர் மேகமூட்டம் இருந்தால் பூ உதிர்தல் ஏற்படும்.",
      hi: "फूल आते समय लगातार बादल छाए रहने से फूल झड़ने का खतरा।"
    },
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
    badgeIcon: "🌱"
  },
  {
    id: "groundnut",
    name: {
      en: "Groundnut / Peanut",
      kn: "ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ",
      te: "వేరుశనగ (పల్లీ)",
      ta: "நிலக்கடலை (வேர்க்கடலை)",
      hi: "मूंगफली (पीनट)"
    },
    scientificName: "Arachis hypogaea",
    category: "Oilseed / Legume",
    suitability: "suitabilityHigh",
    waterReq: "waterReqMed",
    waterScore: 2,
    idealSoil: ["red", "sandy"],
    duration: "100 - 115 Days",
    sowingWindow: {
      en: "June to July (Kharif) / Nov to Dec (Rabi)",
      kn: "ಜೂನ್ - ಜುಲೈ / ನವೆಂಬರ್ - ಡಿಸೆಂಬರ್",
      te: "జూన్ - జూలై / నవంబర్ - డిసెంబర్",
      ta: "ஜூன் - ஜூலை / நவம்பர் - டிசம்பர்",
      hi: "जून से जुलाई / नवंबर से दिसंबर"
    },
    whyRecommended: {
      en: [
        "High market value cash crop suitable for sandy and red soils.",
        "Leaves and haulm provide nutritious green fodder for farm cattle.",
        "Enriches topsoil with organic matter and biological activity.",
        "Short turnaround time allows quick transition to next season."
      ],
      kn: [
        "ಕೆಂಪು ಮತ್ತು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾದ ಉತ್ತಮ ವಾಣಿಜ್ಯ ಬೆಳೆ.",
        "ಶೇಂಗಾ ಸೊಪ್ಪು ರಾಸುಗಳಿಗೆ ಉತ್ತಮ ಪೌಷ್ಟಿಕ ಮೇವಾಗುತ್ತದೆ.",
        "ಮೇಲ್ಮಣ್ಣಿನಲ್ಲಿ ಸಾವಯವ ಅಂಶ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
        "ಕಡಿಮೆ ದಿನಗಳಲ್ಲಿ ಕೈಗೆ ಬರುವುದರಿಂದ ಮುಂದಿನ ಬೆಳೆಗೆ ಬೇಗ ಭೂಮಿ ಸಿದ್ಧವಾಗುತ್ತದೆ."
      ],
      te: [
        "ఎర్ర మరియు ఇసుక నేలలకు సరిపోయే మంచి లాభదాయక పంట.",
        "వేరుశనగ ఆకులు పశువులకు బలమైన పోషక ఆహారంగా ఉపయోగపడతాయి.",
        "పైనేలలో సేంద్రీయ పదార్థాన్ని పెంచుతుంది.",
        "త్వరగా చేతికి రావడం వల్ల తర్వాతి పంటకు అనుకూలం."
      ],
      ta: [
        "செம்மண் மற்றும் மணல் நிலங்களுக்கு ஏற்ற சிறந்த பணப்பயிர்.",
        "நிலக்கடலை கொடி கால்நடைகளுக்கு சத்தான தீவனமாக பயன்படுகிறது.",
        "மண்ணில் நுண்ணுயிர் பெருக்கத்தை அதிகரிக்கிறது.",
        "குறுகிய காலத்தில் அறுவடைக்கு வந்து அடுத்த பயிருக்கு வழிவகுக்கும்."
      ],
      hi: [
        "लाल और बलुई मिट्टी के लिए उपयुक्त लाभकारी नकदी फसल।",
        "मूंगफली की पत्तियां मवेशियों के लिए पौष्टिक हरा चारा बनती हैं।",
        "मिट्टी में जैविक कार्बन और सूक्ष्मजीवों को बढ़ावा देती है।",
        "कम समय में पकने के कारण अगली फसल के लिए खेत जल्दी खाली।"
      ]
    },
    climateRisks: {
      en: "Severe moisture stress during peg penetration and pod filling stage.",
      kn: "ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ತೀವ್ರ ತೇವಾಂಶದ ಕೊರತೆ ಉಂಟಾದರೆ ಕಾಯಿ ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.",
      te: "ఊడలు దిగే సమయంలో మరియు కాయ ముదిరే దశలో నీటి ఎద్దడి రాకూడదు.",
      ta: "விருது இறங்கும் போதும் காய் பிடிக்கும் போதும் நீர் பற்றாக்குறை ஆபத்தானது.",
      hi: "सुइयां बनते समय और दाना भरते समय सूखे से पैदावार पर गंभीर असर।"
    },
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80",
    badgeIcon: "🥜"
  },
  {
    id: "chickpea",
    name: {
      en: "Chickpea (Bengal Gram / Chana)",
      kn: "ಕಡಲೆ (ಬೆಂಗಾಲ್ ಗ್ರಾಂ)",
      te: "శనగలు (చనా)",
      ta: "கொண்டைக்கடலை (சுண்டல்)",
      hi: "चना (बंगाल ग्राम)"
    },
    scientificName: "Cicer arietinum",
    category: "Pulse / Winter Crop",
    suitability: "suitabilityModerate",
    waterReq: "waterReqLow",
    waterScore: 1,
    idealSoil: ["black", "other"],
    duration: "90 - 110 Days",
    sowingWindow: {
      en: "October to November (Rabi Season)",
      kn: "ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್ (ಹಿಂಗಾರು)",
      te: "అక్టోబర్ - నవంబర్ (రబీ కాలం)",
      ta: "அக்டோபர் - நவம்பர் (குளிர்காலம்)",
      hi: "अक्टूबर से नवंबर (रबी मौसम)"
    },
    whyRecommended: {
      en: [
        "Utilizes residual soil moisture in deep black soils after monsoon.",
        "Low input requirements and high market demand.",
        "Improves soil nitrogen balance for next summer/kharif crop."
      ],
      kn: [
        "ಮುಂಗಾರಿನ ನಂತರ ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಉಳಿಯುವ ತೇವಾಂಶವನ್ನು ಚೆನ್ನಾಗಿ ಬಳಸಿಕೊಳ್ಳುತ್ತದೆ.",
        "ಕಡಿಮೆ ಖರ್ಚು, ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ಬೆಲೆ.",
        "ಮುಂದಿನ ಮುಂಗಾರು ಬೆಳೆಗೆ ಮಣ್ಣಿನಲ್ಲಿ ಸಾರಜನಕ ಉಳಿಸುತ್ತದೆ."
      ],
      te: [
        "ఖరీఫ్ తర్వాత నల్లరేగడి నేలలో మిగిలిన తేమతో సులభంగా పండుతుంది.",
        "తక్కువ పెట్టుబడి, మంచి మార్కెట్ ధర.",
        "తదుపరి పంటకు భూమిలో సారాన్ని పెంచుతుంది."
      ],
      ta: [
        "மழைக்காலத்திற்கு பின் கரிசல் மண்ணில் உள்ள எஞ்சிய ஈரப்பதத்திலேயே வளரும்.",
        "குறைந்த செலவு மற்றும் நிலையான சந்தை மதிப்பு.",
        "அடுத்த பருவத்திற்கு மண்ணை வளப்படுத்துகிறது."
      ],
      hi: [
        "मानसून के बाद काली मिट्टी में बची हुई नमी पर आसानी से तैयार।",
        "कम लागत और बाजार में साल भर अच्छी मांग।",
        "अगली खरीफ फसल के लिए मिट्टी में नाइट्रोजन संतुलन।"
      ]
    },
    climateRisks: {
      en: "High humidity promotes fungal blight; sensitive to unseasonal winter rain.",
      kn: "ಹೆಚ್ಚು ತೇವಾಂಶ ಮತ್ತು ಚಳಿಗಾಲದ ಅಕಾಲಿಕ ಮಳೆಯಿಂದ ಬೂದಿ ರೋಗ ಬರುವ ಸಾಧ್ಯತೆ.",
      te: "ఎక్కువ తేమ వల్ల బూడిద తెగులు వచ్చే అవకాశం ఉంది.",
      ta: "அதிக காற்றில் ஈரப்பதம் மற்றும் பருவம் தவறிய மழை நோய்களை உருவாக்கும்.",
      hi: "अधिक आर्द्रता और बेमौसम सर्दी की बारिश से उकठा व फफूंद रोग का खतरा।"
    },
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    badgeIcon: "🥣"
  },
  {
    id: "maize",
    name: {
      en: "Maize / Corn",
      kn: "ಮೆಕ್ಕೆಜೋಳ (ಕಾರ್ನ್)",
      te: "మొక్కజొన్న",
      ta: "மக்காச்சோளம்",
      hi: "मक्का (भुट्टा)"
    },
    scientificName: "Zea mays",
    category: "Cereal / Fodder",
    suitability: "suitabilityModerate",
    waterReq: "waterReqMed",
    waterScore: 2,
    idealSoil: ["red", "black", "other"],
    duration: "95 - 110 Days",
    sowingWindow: {
      en: "June - July or Oct - Nov",
      kn: "ಜೂನ್ - ಜುಲೈ ಅಥವಾ ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್",
      te: "జూన్ - జూలై లేదా అక్టోబర్ - నవంబర్",
      ta: "ஜூன் - ஜூலை அல்லது அக்டோபர் - நவம்பர்",
      hi: "जून - जुलाई या अक्टूबर - नवंबर"
    },
    whyRecommended: {
      en: [
        "Fast growing with high biomass production.",
        "Versatile crop for grain, poultry feed, and cattle silage.",
        "Fits well in dual-crop rotations with pulses."
      ],
      kn: [
        "ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಮತ್ತು ಹೆಚ್ಚು ಮೇವು ನೀಡುವ ಬೆಳೆ.",
        "ಕೋಳಿ ಆಹಾರ ಮತ್ತು ದನಕರುಗಳ ಮೇವಿಗೆ ಸದಾ ಬೇಡಿಕೆ.",
        "ದ್ವಿದಳ ಧಾನ್ಯಗಳ ಜೊತೆ ಬೆಳೆ ಪರಿವರ್ತನೆಗೆ ಸೂಕ್ತ."
      ],
      te: [
        "వేగంగా పెరుగుతుంది, మంచి దిగుబడి ఇస్తుంది.",
        "కోళ్ల దాణా మరియు పశుగ్రాసానికి మార్కెట్లో డిమాండ్.",
        "పప్పుధాన్యాలతో పంట మార్పిడికి అనుకూలం."
      ],
      ta: [
        "வேகமாக வளரும், அதிக தீவன உற்பத்தி தரும்.",
        "கோழி தீவனம் மற்றும் கால்நடை உணவுக்கு நிலையான சந்தை.",
        "பயறு வகைகளுடன் பயிர் சுழற்சி செய்ய ஏற்றது."
      ],
      hi: [
        "तेजी से बढ़ने वाली और भरपूर चारा देने वाली फसल।",
        "पोल्ट्री फीड और पशु आहार के लिए बाजार में भारी मांग।",
        "दलहनी फसलों के साथ फसल चक्र में फिट बैठती है।"
      ]
    },
    climateRisks: {
      en: "Drought stress during silking and pollination severely drops grain set.",
      kn: "ತೆನೆ ಮೂಡುವಾಗ ನೀರು ಕಡಿಮೆಯಾದರೆ ಕಾಳು ಕಟ್ಟುವುದಿಲ್ಲ.",
      te: "కంకి పాలు పోసుకునే సమయంలో నీరు అందకపోతే గింజలు సరిగా పడవు.",
      ta: "பூத்து கதிர் வரும் போது தண்ணீர் தட்டுப்பாடு ஏற்பட்டால் மணி பிடிக்காது.",
      hi: "मंजरी और दाना बनने की अवस्था में पानी की कमी से उत्पादन घटता है।"
    },
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    badgeIcon: "🌽"
  }
];

// NASA Earth Observation and Climatology Sample Data
export const nasaClimateData = {
  station: {
    village: "Mandya District (Agro-Climatic Zone 6)",
    coordinates: "12.52° N, 76.89° E",
    elevation: "678 m ASL",
    retrievalDate: "12 November 2026",
    powerSource: "NASA POWER Release 8 (Agroclimatology MERRA-2)",
    gpmSource: "NASA GPM IMERG Final Run V06B (Satellite Precipitation)"
  },
  currentObserved: {
    tempMax: 31.4,
    tempMin: 19.8,
    tempMean: 25.6,
    dailyRadiation: 19.2, // MJ/m^2/day
    topsoilMoisture: 0.22, // m^3/m^3 (approx 22% volumetric)
    moistureStatus: "Adequate for dryland millets; moderate irrigation recommended for vegetables",
    humidity: 62, // %
    windSpeed: 2.8 // m/s
  },
  historicalTrends: [
    { month: "Jun", rainfall10YrAvg: 68, rainfallRecentYear: 52, radiation: 18.1 },
    { month: "Jul", rainfall10YrAvg: 82, rainfallRecentYear: 94, radiation: 17.4 },
    { month: "Aug", rainfall10YrAvg: 95, rainfallRecentYear: 61, radiation: 17.8 },
    { month: "Sep", rainfall10YrAvg: 135, rainfallRecentYear: 142, radiation: 18.9 },
    { month: "Oct", rainfall10YrAvg: 148, rainfallRecentYear: 110, radiation: 19.4 },
    { month: "Nov", rainfall10YrAvg: 54, rainfallRecentYear: 48, radiation: 19.1 }
  ],
  seasonalOutlook: {
    season: "Rabi 2026-27 (Winter)",
    soilMoistureTrend: "Gradually declining topsoil moisture due to dry post-monsoon conditions",
    thermalRegime: "Favorable cool nights (18-20°C) suitable for pulses, millets and oilseeds",
    rainfallAnomaly: "Normal to slightly below-normal rainfall (-12% satellite anomaly vs 15-yr IMERG baseline)"
  }
};

// Crop Rotation Multi-Season Plans
export const rotationPlansData = {
  planA: {
    id: "planA",
    title: {
      en: "Water-Smart Legume Cycle (Soil Rebuilding)",
      kn: "ಯೋಜನೆ 1: ನೀರು ಉಳಿಸುವ ದ್ವಿದಳ ಧಾನ್ಯ ಚಕ್ರ (ಮಣ್ಣು ಸುಧಾರಣೆ)",
      te: "ప్లాన్ 1: నీటి ఆదా పప్పుధాన్యాల చక్రం (భూసార పెంపు)",
      ta: "திட்டம் 1: நீர் சேமிக்கும் பயறு சுழற்சி (மண் வள மீட்பு)",
      hi: "योजना 1: पानी बचाने वाला दलहन चक्र (मिट्टी सुधार)"
    },
    tagline: {
      en: "Finger Millet ➔ Red Gram ➔ Green Manure / Sunnhemp",
      kn: "ರಾಗಿ ➔ ತೊಗರಿ ➔ ಹಸಿರೆಲೆ ಗೊಬ್ಬರ (ಸಣಬು)",
      te: "రాగులు ➔ కందులు ➔ పచ్చిరొట్ట ఎరువు (జనుము)",
      ta: "கேழ்வரகு ➔ துவரை ➔ பசுந்தாள் உரம் (சணப்பை)",
      hi: "रागी ➔ अरहर दाल ➔ हरी खाद (सनई)"
    },
    seasons: [
      {
        seasonNumber: 1,
        seasonName: {
          en: "Kharif (Monsoon)",
          kn: "ಮುಂಗಾರು (ಖಾರೀಫ್)",
          te: "ఖరీఫ్ (వర్షాకాలం)",
          ta: "காரிஃப் (மழைக்காலம்)",
          hi: "खरीफ (मानसून)"
        },
        crop: "Finger Millet (Ragi)",
        cropKey: "ragi",
        timing: "July - October",
        waterImpact: "Low (300-350 mm)",
        benefit: {
          en: "Secures staple food grain with minimal rain dependency",
          kn: "ಕಡಿಮೆ ಮಳೆಯಲ್ಲೂ ಕುಟುಂಬಕ್ಕೆ ಅಗತ್ಯ ಆಹಾರ ಧಾನ್ಯ ಖಾತರಿ",
          te: "తక్కువ వర్షంతో కుటుంబానికి ఆహార భద్రత",
          ta: "குறைந்த மழையிலும் குடும்ப உணவு பாதுகாப்பு உறுதி",
          hi: "कम बारिश में भी परिवार के लिए मुख्य अनाज की सुरक्षा"
        }
      },
      {
        seasonNumber: 2,
        seasonName: {
          en: "Rabi (Winter)",
          kn: "ಹಿಂಗಾರು (ರಬಿ)",
          te: "రబీ (శీతాకాలం)",
          ta: "ரபி (குளிர்காலம்)",
          hi: "रबी (सर्दी)"
        },
        crop: "Red Gram (Pigeon Pea)",
        cropKey: "redgram",
        timing: "November - March",
        waterImpact: "Low (Residual Moisture)",
        benefit: {
          en: "Fixes 40-50 kg/hectare atmospheric nitrogen in soil",
          kn: "ಪ್ರತಿ ಹೆಕ್ಟೇರಿಗೆ 40-50 ಕೆಜಿ ಸಾರಜನಕವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಸೇರಿಸುತ್ತದೆ",
          te: "హెక్టారుకు 40-50 కిలోల నత్రజనిని నేలలో నిల్వ చేస్తుంది",
          ta: "ஹெக்டேருக்கு 40-50 கிலோ தழைச்சத்தை மண்ணில் சேர்க்கிறது",
          hi: "प्रति हेक्टेयर 40-50 किलो नाइट्रोजन मिट्टी में जोड़ती है"
        }
      },
      {
        seasonNumber: 3,
        seasonName: {
          en: "Summer (Pre-Monsoon)",
          kn: "ಬೇಸಿಗೆ (ಹಸಿರೆಲೆ ಗೊಬ್ಬರ)",
          te: "వేసవి (పచ్చిరొట్ట)",
          ta: "கோடை (பசுந்தாள் உரம்)",
          hi: "जायद / ग्रीष्म (हरी खाद)"
        },
        crop: "Sunnhemp / Cowpea (Green Manure)",
        cropKey: "sunnhemp",
        timing: "April - June",
        waterImpact: "Minimal (Survives on early summer showers)",
        benefit: {
          en: "Ploughed back into soil to create deep humus and retain monsoon rain",
          kn: "ಭೂಮಿಯಲ್ಲಿ ಉಳುಮೆ ಮಾಡುವುದರಿಂದ ಸಾವಯವ ಇಂಗಾಲ ಹೆಚ್ಚಿ ಮಳೆ ನೀರು ಇಂಗುತ್ತದೆ",
          te: "భూమిలోనే కలియదున్నడం వల్ల నేల గుల్లబారి తేమ నిలుస్తుంది",
          ta: "நிலத்திலேயே உழுது விடுவதால் மக்கிய உரமாகி மழைநீரை தேக்கும்",
          hi: "मिट्टी में पलटाई करने से जीवांश कार्बन बढ़ता है और बारिश का पानी ठहरता है"
        }
      }
    ],
    overallBenefits: {
      en: [
        "Saves 35% irrigation water compared to continuous cereal cropping.",
        "Reduces commercial fertilizer expenditure by ₹4,500 - ₹6,000 per acre.",
        "Breaks pest and fungal disease cycles naturally."
      ],
      kn: [
        "ಸತತ ಧಾನ್ಯ ಬೆಳೆಯುವುದಕ್ಕಿಂತ ಶೇ 35 ರಷ್ಟು ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ.",
        "ರಾಸಾಯನಿಕ ಗೊಬ್ಬರದ ಖರ್ಚು ಎಕರೆಗೆ ₹4,500 ರಿಂದ ₹6,000 ರಷ್ಟು ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
        "ಕೀಟ ಮತ್ತು ರೋಗ ಬಾಧೆಯ ಚಕ್ರ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮುರಿಯುತ್ತದೆ."
      ],
      te: [
        "సాధారణ పద్ధతి కంటే 35% సాగునీరు ఆదా అవుతుంది.",
        "ఎరువుల ఖర్చు ఎకరానికి ₹4,500 నుండి ₹6,000 వరకు తగ్గుతుంది.",
        "చీడపీడల వ్యాప్తి సహజంగా అదుపులోకి వస్తుంది."
      ],
      ta: [
        "வழக்கமான சாகுபடியை விட 35% பாசன நீர் சேமிக்கப்படுகிறது.",
        "உரச் செலவு ஏக்கருக்கு ₹4,500 முதல் ₹6,000 வரை மிச்சமாகும்.",
        "பூச்சி மற்றும் பூஞ்சை நோய்களின் தாக்கம் குறையும்."
      ],
      hi: [
        "पारंपरिक खेती की तुलना में 35% सिंचाई जल की बचत।",
        "रासायनिक खाद का खर्च ₹4,500 से ₹6,000 प्रति एकड़ तक घटता है।",
        "कीट और बीमारियों का चक्र प्राकृतिक रूप से टूटता है।"
      ]
    }
  },

  planB: {
    id: "planB",
    title: {
      en: "High-Resilience Millet & Oilseed Cycle (Income Balance)",
      kn: "ಯೋಜನೆ 2: ಸಿರಿಧಾನ್ಯ ಮತ್ತು ಶೇಂಗಾ ಚಕ್ರ (ಸ್ಥಿರ ಆದಾಯ)",
      te: "ప్లాన్ 2: చిరుధాన్యాలు మరియు వేరుశనగ చక్రం (ఆదాయ భద్రత)",
      ta: "திட்டம் 2: சிறுதானியங்கள் மற்றும் எண்ணெய் வித்து சுழற்சி (வருமான சமநிலை)",
      hi: "योजना 2: मोटा अनाज और तिलहन चक्र (आय संतुलन)"
    },
    tagline: {
      en: "Groundnut ➔ Finger Millet ➔ Chickpea",
      kn: "ಶೇಂಗಾ (ಕಡಲೆಕಾಯಿ) ➔ ರಾಗಿ ➔ ಕಡಲೆ",
      te: "వేరుశనగ ➔ రాగులు ➔ శనగలు",
      ta: "நிலக்கடலை ➔ கேழ்வரகு ➔ கொண்டைக்கடலை",
      hi: "मूंगफली ➔ रागी ➔ चना"
    },
    seasons: [
      {
        seasonNumber: 1,
        seasonName: {
          en: "Kharif (Monsoon)",
          kn: "ಮುಂಗಾರು (ಖಾರೀಫ್)",
          te: "ఖరీఫ్ (వర్షాకాలం)",
          ta: "காரிஃப் (மழைக்காலம்)",
          hi: "खरीफ (मानसून)"
        },
        crop: "Groundnut (Peanut)",
        cropKey: "groundnut",
        timing: "June - September",
        waterImpact: "Medium (400 mm)",
        benefit: {
          en: "High cash return and nitrogen enrichment through root nodules",
          kn: "ಉತ್ತಮ ನಗದು ಆದಾಯ ಮತ್ತು ಬೇರುಗಳಲ್ಲಿ ಸಾರಜನಕ ಗಂಟುಗಳು ಉತ್ಪತ್ತಿ",
          te: "మంచి మార్కెట్ ఆదాయం మరియు వేర్ల ద్వారా నత్రజని స్థిరీకరణ",
          ta: "சிறந்த சந்தை வருமானம் மற்றும் வேர் முடிச்சுகள் மூலம் தழைச்சத்து",
          hi: "उत्कृष्ट नकदी आय और जड़ों की ग्रंथियों द्वारा नाइट्रोजन संचय"
        }
      },
      {
        seasonNumber: 2,
        seasonName: {
          en: "Rabi (Late Autumn/Winter)",
          kn: "ಹಿಂಗಾರು (ರಬಿ)",
          te: "రబీ (శీతాకాలం)",
          ta: "ரபி (குளिर்காலம்)",
          hi: "रबी (सर्दी)"
        },
        crop: "Finger Millet (Ragi)",
        cropKey: "ragi",
        timing: "October - January",
        waterImpact: "Low",
        benefit: {
          en: "Feed and grain resilience utilizing residual groundnut nutrients",
          kn: "ಶೇಂಗಾ ಬಿಟ್ಟುಹೋದ ಪೋಷಕಾಂಶಗಳನ್ನು ಬಳಸಿ ರಾಗಿ ಉತ್ತಮವಾಗಿ ಬೆಳೆಯುತ್ತದೆ",
          te: "వేరుశనగ మిగిల్చిన పోషకాలతో రాగుల పంట పుష్టిగా పండుతుంది",
          ta: "நிலக்கடலை விட்டுச்சென்ற சத்துக்களை பயன்படுத்தி கேழ்வரகு செழிக்கும்",
          hi: "मूंगफली द्वारा छोड़े गए पोषक तत्वों पर रागी की शानदार पैदावार"
        }
      },
      {
        seasonNumber: 3,
        seasonName: {
          en: "Summer / Post-Rabi",
          kn: "ಬೇಸಿಗೆ / ನಂತರದ ಬೆಳೆ",
          te: "వేసవి కాలం",
          ta: "கோடை பருவம்",
          hi: "जायद / ग्रीष्म काल"
        },
        crop: "Chickpea (Bengal Gram)",
        cropKey: "chickpea",
        timing: "February - April",
        waterImpact: "Low",
        benefit: {
          en: "Protects soil from crusting and provides valuable market pulse",
          kn: "ಬೇಸಿಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಮಣ್ಣು ಒಣಗದಂತೆ ರಕ್ಷಿಸಿ ಬೆಲೆಬಾಳುವ ಕಾಳು ನೀಡುತ್ತದೆ",
          te: "ఎండల వల్ల నేల బీటలు వారకుండా కాపాడి మంచి పంటనిస్తుంది",
          ta: "கோடையில் நிலம் வறண்டு வெடிக்காமல் தடுத்து நல்ல பயறு விளைச்சல் தரும்",
          hi: "गर्मी में मिट्टी को फटने से बचाती है और कीमती दाल देती है"
        }
      }
    ],
    overallBenefits: {
      en: [
        "Balances immediate cash income from oilseeds with family food security.",
        "Maintains continuous ground cover preventing topsoil erosion.",
        "Adaptable to erratic rainfall patterns."
      ],
      kn: [
        "ಶೇಂಗಾದಿಂದ ನಗದು ಹಣ ಮತ್ತು ರಾಗಿಯಿಂದ ಮನೆಗೆ ಆಹಾರ ಭದ್ರತೆ ಎರಡೂ ಸಮತೋಲನ.",
        "ವರ್ಷವಿಡೀ ಭೂಮಿಯ ಮೇಲೆ ಹಸಿರು ಹೊದಿಕೆ ಇರುವುದರಿಂದ ಮೇಲ್ಮಣ್ಣು ಕೊಚ್ಚಿಹೋಗುವುದಿಲ್ಲ.",
        "ಅನಿಶ್ಚಿತ ಮಳೆಯ ಸಂದರ್ಭದಲ್ಲೂ ರೈತರ ಕೈ ಹಿಡಿಯುತ್ತದೆ."
      ],
      te: [
        "నూనెగింజల ద్వారా నగదు, చిరుధాన్యాల ద్వారా ఆహార భద్రత రెండూ లభిస్తాయి.",
        "ఏడాది పొడవునా నేల కప్పి ఉండటం వల్ల పైమట్టి కొట్టుకుపోదు.",
        "సరిగా వర్షాలు పడకపోయినా నష్టాన్ని తగ్గిస్తుంది."
      ],
      ta: [
        "எண்ணெய் வித்து மூலம் உடனடி பணமும், தானியம் மூலம் உணவு பாதுகாப்பும் கிடைக்கும்.",
        "ஆண்டு முழுவதும் நிலம் பயிரால் மூடப்பட்டிருப்பதால் மேல்மண் அரிப்பு தடுக்கப்படுகிறது.",
        "எதிர்பாராத மழை மாற்றங்களிலும் நஷ்டம் ஏற்படாது."
      ],
      hi: [
        "तिलहन से तत्काल नकद आय और मोटे अनाज से पारिवारिक खाद्य सुरक्षा।",
        "साल भर जमीन हरी रहने से उपजाऊ ऊपरी मिट्टी का कटाव रुकता है।",
        "अनियमित बारिश के जोखिम में भी किसान को सुरक्षा।"
      ]
    }
  }
};

// Climate and Weather Alerts
export const climateAlertsData = [
  {
    id: "alert-dry-spell",
    severity: "warning", // warning (orange) or danger (red)
    title: {
      en: "Moderate Dry Spell Warning (10 Days)",
      kn: "ಮಧ್ಯಮ ಮಳೆ ಕೊರತೆ ಎಚ್ಚರಿಕೆ (ಮುಂದಿನ 10 ದಿನ)",
      te: "వర్షాభావ హెచ్చరిక (వచ్చే 10 రోజులు)",
      ta: "மிதமான மழை பற்றாக்குறை எச்சரிக்கை (10 நாட்கள்)",
      hi: "मध्यम सूखा चेतावनी (अगले 10 दिन)"
    },
    icon: "☀️",
    explanation: {
      en: "Satellite precipitation models (NASA GPM IMERG) indicate minimal rainfall (<5mm) across the local zone over the next 10 days.",
      kn: "ನಾಸಾ ಜಿಪಿಎಂ (NASA GPM) ಉಪಗ್ರಹ ಮಾದರಿಯ ಪ್ರಕಾರ ಮುಂದಿನ 10 ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಭಾಗದಲ್ಲಿ ಮಳೆ ಬಹುತೇಕ ಕಡಿಮೆ (5 ಮಿಮೀಗಿಂತ ಕಡಿಮೆ) ಇರಲಿದೆ.",
      te: "నాసా జిపిఎం శాటిలైట్ సమాచారం ప్రకారం వచ్చే 10 రోజుల్లో మీ ప్రాంతంలో వర్షం చాలా తక్కువగా (<5 మి.మీ) నమోదయ్యే అవకాశం ఉంది.",
      ta: "நாசா ஜிபிஎம் செயற்கைக்கோள் கணிப்பின்படி அடுத்த 10 நாட்களில் மிகக்குறைந்த மழையே (<5 மிமீ) பதிவாகும்.",
      hi: "नासा जीपीएम (NASA GPM) उपग्रह मॉडल के अनुसार अगले 10 दिनों में क्षेत्र में बहुत कम बारिश (<5 मिमी) की संभावना है।"
    },
    suggestedAction: {
      en: "Apply dry crop residue or leaf mulch around plant roots to conserve soil moisture. Postpone non-essential chemical weedicide sprays.",
      kn: "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳಲು ಸಸ್ಯಗಳ ಬುಡಕ್ಕೆ ಒಣ ಎಲೆ ಅಥವಾ ಹುಲ್ಲಿನ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಹಾಕಿ. ಅನಗತ್ಯ ಕಳೆನಾಶಕ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ.",
      te: "నేలలో తేమ ఆరిపోకుండా మొక్కల మొదళ్ల వద్ద ఎండు ఆకుల కవచం (మల్చింగ్) వేయండి. కలుపు మందుల పిచికారీని వాయిదా వేయండి.",
      ta: "மண்ணில் ஈரப்பதத்தை காக்க பயிரின் வேர்ப்பகுதியில் காய்ந்த சருகுகள் அல்லது வைக்கோல் மூடாக்கு இடவும். களைக்கொல்லி தெளிப்பதை தள்ளிப்போடவும்.",
      hi: "मिट्टी की नमी बचाने के लिए पौधों की जड़ों के पास सूखी घास या पत्तियों की मल्चिंग करें। अनावश्यक खरपतवारनाशी छिड़काव टालें।"
    },
    validity: "13 Nov 2026 - 23 Nov 2026",
    source: "NASA GPM IMERG Satellite Precipitation Anomaly (Calculated vs 15-year baseline)"
  },
  {
    id: "alert-temp-spike",
    severity: "warning",
    title: {
      en: "Unseasonal Daytime Heat Spike Advisory",
      kn: "ಅಕಾಲಿಕ ಗರಿಷ್ಠ ಉಷ್ಣಾಂಶ ಎಚ್ಚರಿಕೆ",
      te: "పగటి ఉష్ణోగ్రత పెరుగుదల సూచన",
      ta: "பகலில் அதிக வெப்பநிலை எச்சரிக்கை",
      hi: "असामान्य दिन का तापमान वृद्धि परामर्श"
    },
    icon: "🌡️",
    explanation: {
      en: "Afternoon temperatures are estimated to run 2.8°C above seasonal climatological normal (NASA POWER MERRA-2 thermal index).",
      kn: "ಮಧ್ಯಾಹ್ನದ ತಾಪಮಾನವು ವಾಡಿಕೆಗಿಂತ 2.8°C ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ (ನಾಸಾ ಪವರ್ ಉಷ್ಣಾಂಶ ಮಾದರಿ).",
      te: "మధ్యాహ్న ఉష్ణోగ్రతలు సాధారణం కంటే 2.8°C ఎక్కువగా నమోదయ్యే అవకాశం ఉంది.",
      ta: "பகல் நேர வெப்பநிலை இயல்பை விட 2.8°C அதிகமாக இருக்கக்கூடும் என கணிக்கப்பட்டுள்ளது.",
      hi: "दोपहर का तापमान सामान्य मौसमी औसत से 2.8°C अधिक रहने का अनुमान है।"
    },
    suggestedAction: {
      en: "Provide light evening irrigation to sensitive vegetable and nursery crops to prevent moisture evaporation stress.",
      kn: "ತರಕಾರಿ ಮತ್ತು ನರ್ಸರಿ ಸಸಿಗಳು ಬಾಡದಂತೆ ಸಂಜೆಯ ಸಮಯದಲ್ಲಿ ಲಘು ನೀರಾವರಿ ನೀಡಿ.",
      te: "కూరగాయలు మరియు నర్సరీ మొలకలు వాడిపోకుండా సాయంత్రం వేళల్లో తేలికపాటి తడులు ఇవ్వండి.",
      ta: "காய்கறி மற்றும் நாற்றுப் பயிர்கள் வாடாமல் இருக்க மாலை வேளையில் லேசான நீர் பாய்ச்சவும்.",
      hi: "सब्जियों और नर्सरी की फसलों को मुरझाने से बचाने के लिए शाम के समय हल्की सिंचाई करें।"
    },
    validity: "14 Nov 2026 - 19 Nov 2026",
    source: "NASA POWER 2m Temperature Anomaly Tracker"
  },
  {
    id: "alert-water-stress",
    severity: "danger",
    title: {
      en: "Root-Zone Moisture Stress Risk",
      kn: "ಬೇರು ವಲಯದ ತೇವಾಂಶ ಕೊರತೆ ತೀವ್ರ ಅಪಾಯ",
      te: "వేర్ల వద్ద తీవ్ర తేమ కొరత ముప్పు",
      ta: "வேர்ப்பகுதி தீவிர நீர் பற்றாக்குறை அபாயம்",
      hi: "जड़ क्षेत्र में गंभीर नमी तनाव का खतरा"
    },
    icon: "💧",
    explanation: {
      en: "Topsoil moisture index indicates rapid dry-down below critical wilting thresholds in non-irrigated sandy plots.",
      kn: "ಮರಳು ಮಿಶ್ರಿತ ಭೂಮಿಯಲ್ಲಿ ನೀರಾವರಿ ಇಲ್ಲದಿದ್ದಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶ ಗಣನೀಯವಾಗಿ ಕುಸಿಯುವ ಸಂಭವವಿದೆ.",
      te: "నీటి వసతి లేని ఇసుక నేలల్లో తేమ ప్రమాదకర స్థాయికి పడిపోయే ప్రమాదం ఉంది.",
      ta: "பாசன வசதி இல்லாத மணல் கலந்த நிலங்களில் மண் ஈரப்பதம் வேகமாக வறண்டு போகக்கூடும்.",
      hi: "बिना सिंचाई वाले बलुई खेतों में मिट्टी की नमी क्रांतिक स्तर से नीचे जाने का अंदेशा।"
    },
    suggestedAction: {
      en: "Prioritize protective water application immediately for crops currently in flowering or grain-fill stage.",
      kn: "ಹೂವಾಡುವ ಅಥವಾ ಕಾಳು ಕಟ್ಟುವ ಹಂತದಲ್ಲಿರುವ ಬೆಳೆಗಳಿಗೆ ತಕ್ಷಣವೇ ಜೀವ ರಕ್ಷಕ ನೀರು ಕೊಡಿ.",
      te: "పూత లేదా గింజ దశలో ఉన్న పంటలకు వెంటనే జీవనాధార నీటి తడి అందించండి.",
      ta: "பூ பூக்கும் அல்லது கதிர் வரும் நிலையில் உள்ள பயிர்களுக்கு உடனே உயிர்த் தண்ணீர் பாய்ச்சவும்.",
      hi: "फूल आने या दाना बनने की अवस्था वाली फसलों को तुरंत जीवनरक्षक सिंचाई दें।"
    },
    validity: "Active from 13 Nov 2026",
    source: "NASA POWER Global Modeling and Assimilation Office (GMAO) Soil Moisture Model"
  }
];

// Crop Calendar Stages for Finger Millet (Ragi)
export const calendarStagesData = [
  {
    step: 1,
    titleKey: "stageLandPrep",
    durationLabel: "Days -20 to 0 (Pre-Sowing)",
    icon: "🚜",
    activities: {
      en: [
        "Deep summer ploughing to expose hibernating soil pests to sunlight.",
        "Incorporate 4-5 tonnes of well-rotted Farmyard Manure (FYM) per acre.",
        "Form conservation bunds and contour furrows to trap monsoon rainwater."
      ],
      kn: [
        "ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳವಾದ ಉಳುಮೆ ಮಾಡಿ ಮಣ್ಣಿನೊಳಗಿನ ಕೀಟದ ಮೊಟ್ಟೆಗಳನ್ನು ಬಿಸಿಲಿಗೆ ಒಡ್ಡಿ.",
        "ಎಕರೆಗೆ 4-5 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.",
        "ಮಳೆ ನೀರನ್ನು ಭೂಮಿಯಲ್ಲೇ ಹಿಡಿದಿಡಲು ಬದುಗಳನ್ನು ನಿರ್ಮಿಸಿ ಮತ್ತು ಸಮಪಾತಳಿ ಉಳುಮೆ ಮಾಡಿ."
      ],
      te: [
        "వేసవిలో లోతు దుక్కులు దున్ని నేలలోని పురుగుల గుడ్లు ఎండకు నశించేలా చేయండి.",
        "ఎకరానికి 4-5 టన్నుల మంచి పశువుల ఎరువును భూమిలో కలపండి.",
        "వర్షపు నీటిని నిల్వ చేయడానికి గట్లు వేసి సమతల చాళ్లు ఏర్పాటు చేయండి."
      ],
      ta: [
        "கோடை உழவு செய்து மண்ணில் உள்ள பூச்சிகளின் கூட்டுப்புழுக்களை அழிக்கவும்.",
        "ஏக்கருக்கு 4-5 டன் மக்கிய தொழுவுரத்தை நிலத்தில் இட்டு உழவும்.",
        "மழைநீரை நிலத்தில் தேக்க வரப்புகளை உயர்த்தி சமமட்ட உழவு மேற்கொள்ளவும்."
      ],
      hi: [
        "गर्मी की गहरी जुताई करें ताकि मिट्टी के अंदर के कीट धूप से नष्ट हो जाएं।",
        "प्रति एकड़ 4-5 टन अच्छी तरह सड़ा हुआ गोबर का खाद मिट्टी में मिलाएं।",
        "बारिश का पानी रोकने के लिए मजबूत मेड़बंदी और समोच्च जुताई करें।"
      ]
    }
  },
  {
    step: 2,
    titleKey: "stageSowing",
    durationLabel: "Day 0 to 15 (Sowing & Germination)",
    icon: "🌱",
    activities: {
      en: [
        "Select certified drought-hardy seed varieties (e.g., GPU-28, ML-365).",
        "Seed treatment with Trichoderma or Azospirillum bio-fertilizers.",
        "Maintain spacing: 30 cm between rows, 10 cm between plants."
      ],
      kn: [
        "ಬರ ನಿರೋಧಕ ಪ್ರಮಾಣಿತ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (ಉದಾ: ಜಿಪಿಯು-28, ಎಂಎಲ್-365).",
        "ಬೀಜ ಬಿತ್ತುವ ಮುನ್ನ ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ಅಜೋಸ್ಪಿರಿಲಮ್ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.",
        "ಸಾಲುಗಳ ನಡುವೆ 30 ಸೆಂ.ಮೀ ಮತ್ತು ಗಿಡಗಳ ನಡುವೆ 10 ಸೆಂ.ಮೀ ಅಂತರ ಕಾಪಾಡಿ."
      ],
      te: [
        "కరువు తట్టుకునే మంచి రకాలను ఎంచుకోండి (ఉదా: జిపియు-28, ఎంఎల్-365).",
        "విత్తనాలకు ట్రైకోడెర్మా లేదా అజోస్పైరిల్లమ్‌తో విత్తన శుద్ధి చేయండి.",
        "సాలుకి సాలుకి 30 సెం.మీ, మొక్కకి మొక్కకి 10 సెం.మీ దూరం పాటించండి."
      ],
      ta: [
        "வறட்சி தாங்கும் தரமான விதை ரகங்களை தேர்ந்தெடுக்கவும் (எ.கா. ஜிபியு-28, எம்எல்-365).",
        "டிரைக்கோடெர்மா அல்லது அசோஸ்பைரில்லம் கொண்டு விதை நேர்த்தி செய்யவும்.",
        "வரிசைக்கு வரிசை 30 செ.மீ, செடிக்கு செடி 10 செ.மீ இடைவெளி விடவும்."
      ],
      hi: [
        "सूखा प्रतिरोधी प्रमाणित बीजों का चयन करें (जैसे जीपीयू-28, एमएल-365)।",
        "ट्राइकोडर्मा या एजोस्पिरिलम जैव उर्वरक से बीज उपचार अवश्य करें।",
        "कतार से कतार 30 सेमी और पौधे से पौधे 10 सेमी की दूरी रखें।"
      ]
    }
  },
  {
    step: 3,
    titleKey: "stageIrrigation",
    durationLabel: "Day 15 to 45 (Weeding & Thinning)",
    icon: "💧",
    activities: {
      en: [
        "First inter-cultivation weeding at 20-25 days after sowing.",
        "Thinning excess seedlings to keep one healthy plant per hill.",
        "Ensure field is not waterlogged during unexpected heavy showers."
      ],
      kn: [
        "ಬಿತ್ತಿದ 20-25 ದಿನಗಳಲ್ಲಿ ಮೊದಲ ಎಡೆಯುಳುಮೆ ಮತ್ತು ಕಳೆ ಕೀಳುವ ಕೆಲಸ ಮುಗಿಸಿ.",
        "ಹೆಚ್ಚಿನ ಸಸಿಗಳನ್ನು ಕಿತ್ತು ಪ್ರತಿ ಜಾಗದಲ್ಲಿ ಒಂದೇ ಸದೃಢ ಸಸಿ ಇರುವಂತೆ ವಿರಳ ಮಾಡಿ.",
        "ಭಾರಿ ಮಳೆ ಬಂದರೆ ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದು ಹೋಗಲು ಕಾಲುವೆ ಮಾಡಿ."
      ],
      te: [
        "విత్తిన 20-25 రోజుల్లో మొదటి దఫా కలుపు తీసి అంతర సేద్యం చేయండి.",
        "ఒత్తుగా ఉన్న మొక్కలను తీసివేసి ఆరోగ్యకరమైన మొక్కలను మాత్రమే ఉంచండి.",
        "వర్షం ఎక్కువైతే పొలంలో నీరు నిల్వ ఉండకుండా బయటకు పంపే దారి చూడండి."
      ],
      ta: [
        "விதைத்த 20-25 நாட்களில் முதல் களையெடுத்து இடை உழவு செய்யவும்.",
        "நெருக்கமான நாற்றுகளை கலைத்துவிட்டு ஆரோக்கியமான செடிகளை மட்டும் பராமரிக்கவும்.",
        "அதிக மழை பெய்தால் வயலில் தண்ணீர் தேங்காமல் வடிய வைக்கவும்."
      ],
      hi: [
        "बुवाई के 20-25 दिन बाद पहली निराई-गुड़ाई और खरपतवार नियंत्रण करें।",
        "घने पौधों को उखाड़कर छांटें ताकि हर स्थान पर स्वस्थ पौधा रहे।",
        "अचानक तेज बारिश होने पर खेत से फालतू पानी निकालने की व्यवस्था रखें।"
      ]
    }
  },
  {
    step: 4,
    titleKey: "stageFertilizer",
    durationLabel: "Day 45 to 65 (Nutrition & Tillering)",
    icon: "🌿",
    activities: {
      en: [
        "Apply balanced nitrogen top-dressing before second inter-cultivation.",
        "Spray 1% Panchagavya or Jeevamrutha organic growth booster.",
        "Monitor leaves for stem borer or armyworm egg clusters."
      ],
      kn: [
        "ಎರಡನೇ ಎಡೆಯುಳುಮೆಗೆ ಮುನ್ನ ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ಅಥವಾ ಮೇಲುಗೊಬ್ಬರ ಕೊಡಿ.",
        "ಶೇಕಡಾ 1 ರಷ್ಟು ಪಂಚಗವ್ಯ ಅಥವಾ ಜೀವಾಮೃತವನ್ನು ಬೆಳೆಗೆ ಸಿಂಪಡಿಸಿ.",
        "ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ಅಥವಾ ಲದ್ದಿ ಹುಳುಗಳ ಬಾಧೆ ಇದೆಯೇ ಎಂದು ಎಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
      ],
      te: [
        "రెండవ అంతర సేద్యం ముందు సిఫార్సు చేసిన మోతాదులో పైపాటు ఎరువు వేయండి.",
        "మొక్కల ఎదుగుదలకు 1% పంచగవ్య లేదా జీవామృతం పిచికారీ చేయండి.",
        "కాండం తొలిచే పురుగు ఆనవాళ్లు ఉన్నాయేమో గమనించండి."
      ],
      ta: [
        "இரண்டாவது இடை உழவுக்கு முன் தேவையான மேல் உரம் இடவும்.",
        "பயிர் வளர்ச்சிக்கு 1% பஞ்சகவ்யா அல்லது ஜீவாமிர்தம் தெளிக்கவும்.",
        "தண்டு துளைப்பான் அல்லது புழு தாக்குதல் உள்ளதா என கண்காணிக்கவும்."
      ],
      hi: [
        "दूसरी गुड़ाई से पहले अनुशंसित संतुलित यूरिया या जैविक खाद डालें।",
        "फसल की बढ़वार के लिए 1% पंचगव्य या जीवामृत का छिड़काव करें।",
        "तना छेदक या सुंडी के प्रकोप की जांच करें।"
      ]
    }
  },
  {
    step: 5,
    titleKey: "stageGrowth",
    durationLabel: "Day 65 to 90 (Flowering & Grain Filling)",
    icon: "🌾",
    activities: {
      en: [
        "Critical moisture stage: Provide protective irrigation if rain fails.",
        "Protect earheads from bird damage during milky grain stage.",
        "Check for blast disease spots on earhead necks."
      ],
      kn: [
        "ಅತಿ ಮುಖ್ಯ ತೇವಾಂಶದ ಹಂತ: ಮಳೆ ಬಾರದಿದ್ದರೆ ಈ ಸಮಯದಲ್ಲಿ ಜೀವ ರಕ್ಷಕ ನೀರು ಕೊಡಿ.",
        "ಹಾಲು ತುಂಬುವ ಹಂತದಲ್ಲಿ ಹಕ್ಕಿಗಳು ತೆನೆ ಕುಕ್ಕದಂತೆ ಕಾವಲು ಕಾಯಿರಿ.",
        "ತೆನೆಯ ಕತ್ತಿನ ಭಾಗದಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಕಲೆಗಳಿವೆಯೇ ಎಂದು ಗಮನಿಸಿ."
      ],
      te: [
        "కీలకమైన తేమ దశ: వర్షాలు లేకుంటే ఈ సమయంలో ఖచ్చితంగా నీటి తడి ఇవ్వండి.",
        "గింజ పాలు పోసుకునే దశలో పిట్టలు వాలకుండా జాగ్రత్త పడండి.",
        "కంకి మెడపై మచ్చల తెగులు (బ్లాస్ట్) ఆశిస్తుందేమో పరిశీలించండి."
      ],
      ta: [
        "முக்கிய நீர் தேவைப்படும் பருவம்: மழை இல்லையெனில் உயிர்த் தண்ணீர் அவசியம்.",
        "பால் பிடிக்கும் பருவத்தில் பறவைகள் தானியத்தை சேதப்படுத்தாமல் காக்கவும்.",
        "கதிர் பகுதியில் குலை நோய் தாக்குதல் உள்ளதா என கவனிக்கவும்."
      ],
      hi: [
        "नमी की सबसे नाजुक अवस्था: बारिश न होने पर इस समय सिंचाई अवश्य करें।",
        "दूधिया अवस्था में चिड़ियों से बालियों की सुरक्षा करें।",
        "बाली की गर्दन पर झुलसा (ब्लास्ट) रोग के लक्षणों की निगरानी करें।"
      ]
    }
  },
  {
    step: 6,
    titleKey: "stageHarvest",
    durationLabel: "Day 100 to 120 (Harvesting & Threshing)",
    icon: "🧺",
    activities: {
      en: [
        "Harvest when earheads turn golden brown and seeds become firm.",
        "Cut earheads separately; dry on clean threshing floor for 3-4 days.",
        "Store grain below 10-12% moisture in dry, pest-proof bags."
      ],
      kn: [
        "ತೆನೆಗಳು ಹೊಂಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಳು ಗಟ್ಟಿಯಾದಾಗ ಕೊಯ್ಲು ಪ್ರಾರಂಭಿಸಿ.",
        "ತೆನೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಕೊಯ್ದು ಶುದ್ಧ ಕಣದಲ್ಲಿ 3-4 ದಿನ ಚೆನ್ನಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿ.",
        "ಕಾಳಿನಲ್ಲಿ ಶೇಕಡಾ 10-12 ಕ್ಕಿಂತ ಕಡಿಮೆ ತೇವಾಂಶ ಇರುವಂತೆ ನೋಡಿಕೊಂಡು ಭದ್ರವಾಗಿ ಸಂಗ್ರಹಿಸಿ."
      ],
      te: [
        "కంకులు బంగారు వర్ణంలోకి మారి గింజలు గట్టిపడినప్పుడు కోత కోయండి.",
        "కంకులను వేరుగా కోసి శుభ్రమైన కల్లంలో 3-4 రోజులు బాగా ఎండబెట్టండి.",
        "గింజలలో 10-12% కంటే తక్కువ తేమ ఉండేలా చూసుకుని నిల్వ చేసుకోండి."
      ],
      ta: [
        "கதிர்கள் பொன்னிறமாக மாறி தானியங்கள் கெட்டியானதும் அறுவடை செய்யவும்.",
        "கதிர்களை தனியாக அறுத்து சுத்தமான களத்தில் 3-4 நாட்கள் உலர்த்தவும்.",
        "தானியத்தில் ஈரப்பதம் 10-12% க்கு கீழ் இருக்கும் போது சாக்குகளில் சேமிக்கவும்."
      ],
      hi: [
        "जब बालियां सुनहरी भूरी हो जाएं और दाना कड़ा हो जाए तब कटाई करें।",
        "बालियों को अलग काटकर साफ खलिहान में 3-4 दिन अच्छी तरह धूप में सुखाएं।",
        "दाने में 10-12% से कम नमी होने पर ही कीटमुक्त बोरियों में सुरक्षित भंडारण करें।"
      ]
    }
  }
];

// District and Village choices for fast manual selection
export const sampleLocations = [
  { name: "Mandya, Karnataka", state: "Karnataka", soilDefault: "red" },
  { name: "Kolar, Karnataka", state: "Karnataka", soilDefault: "red" },
  { name: "Anantapur, Andhra Pradesh", state: "Andhra Pradesh", soilDefault: "red" },
  { name: "Kurnool, Andhra Pradesh", state: "Andhra Pradesh", soilDefault: "black" },
  { name: "Thanjavur, Tamil Nadu", state: "Tamil Nadu", soilDefault: "other" },
  { name: "Dharmapuri, Tamil Nadu", state: "Tamil Nadu", soilDefault: "red" },
  { name: "Varanasi, Uttar Pradesh", state: "Uttar Pradesh", soilDefault: "other" },
  { name: "Nashik, Maharashtra", state: "Maharashtra", soilDefault: "black" },
  { name: "Indore, Madhya Pradesh", state: "Madhya Pradesh", soilDefault: "black" }
];
