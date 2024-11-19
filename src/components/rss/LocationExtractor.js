export class LocationExtractor {
  constructor() {
    this.locations = new Set([
      'London', 'Paris', 'New York', 'Tokyo', 'Beijing', 'Moscow', 'Berlin',
      'Rome', 'Madrid', 'Amsterdam', 'Dubai', 'Singapore', 'Sydney', 'Toronto',
      'USA', 'UK', 'China', 'Japan', 'Russia', 'Germany', 'France', 'Italy',
      'Spain', 'Canada', 'Australia', 'India', 'Brazil', 'Mexico', 'Argentina',
      'South Korea', 'North Korea', 'Vietnam', 'Thailand', 'Indonesia',
      'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Israel', 'Iran', 'Iraq',
      'Saudi Arabia', 'Turkey', 'Greece', 'Sweden', 'Norway', 'Denmark',
      'Finland', 'Iceland', 'Ireland', 'Scotland', 'Wales', 'Switzerland',
      'Austria', 'Poland', 'Ukraine', 'Romania', 'Hungary', 'Czech Republic',
      'Portugal', 'Belgium', 'Netherlands', 'Luxembourg', 'Monaco', 'Vatican City',
      '湖南', '新疆', '北京', '上海', '广州', '深圳', '香港', '澳门', '台北'
    ]);
    this.debug = true; // Enable debug mode by default
  }

  extractLocations(text) {
    console.log('🌍 Location Extractor Analysis:');
    console.log('📝 Input text:', text);

    const words = text.split(/\s+/);
    const found = new Set();
    const analyzed = new Map();
    
    console.log('🔍 Processing words:', words.length, 'total words');
    
    // Single word analysis
    for (let i = 0; i < words.length; i++) {
      const word = this.cleanWord(words[i]);
      const isLocation = this.locations.has(word);
      analyzed.set(word, isLocation);
      
      if (isLocation) {
        found.add(word);
        console.log(`✅ Found location: "${word}"`);
      } else {
        console.log(`❌ Not a location: "${word}"`);
      }
      
      // Two-word combinations
      if (i < words.length - 1) {
        const nextWord = this.cleanWord(words[i + 1]);
        const twoWords = `${word} ${nextWord}`;
        const isTwoWordLocation = this.locations.has(twoWords);
        analyzed.set(twoWords, isTwoWordLocation);
        
        if (isTwoWordLocation) {
          found.add(twoWords);
          console.log(`✅ Found two-word location: "${twoWords}"`);
        }
      }
    }

    console.log('📊 Analysis Summary:');
    console.log('- Words analyzed:', analyzed.size);
    console.log('- Locations found:', found.size);
    
    const results = Array.from(found);
    if (results.length === 0) {
      results.push('Unknown Location');
      console.log('⚠️ No locations found, adding "Unknown Location" tag');
    }

    return results;
  }

  cleanWord(word) {
    return word.replace(/[.,!?]/g, '').trim();
  }
}