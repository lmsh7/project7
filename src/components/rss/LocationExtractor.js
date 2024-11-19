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
    this.debug = false;
  }

  extractLocations(text) {
    if (this.debug) {
      console.log('Analyzing text:', text);
    }

    const words = text.split(/\s+/);
    const found = new Set();
    const analyzed = new Map();
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,!?]/g, '');
      analyzed.set(word, this.locations.has(word));
      
      if (this.locations.has(word)) {
        found.add(word);
      }
      
      if (i < words.length - 1) {
        const twoWords = word + ' ' + words[i + 1].replace(/[.,!?]/g, '');
        analyzed.set(twoWords, this.locations.has(twoWords));
        
        if (this.locations.has(twoWords)) {
          found.add(twoWords);
        }
      }
    }

    if (this.debug) {
      console.log('Word analysis:', Object.fromEntries(analyzed));
      console.log('Found locations:', Array.from(found));
    }

    return Array.from(found);
  }
}