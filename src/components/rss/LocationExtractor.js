export class LocationExtractor {
  constructor() {
    this.apiUrl = 'http://localhost:1771/extract_location';
    this.debug = true; // Enable debug mode by default
  }

  async extractLocations(text) {
    if (this.debug) {
      console.log('🌍 Location Extractor Analysis:');
      console.log('📝 Input text:', text);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          content: text
        })
      });

      if (!response.ok) {
        console.error('❌ API request failed:', response.statusText);
        return ['Unknown Location'];
      }

      const data = await response.json();
      
      if (this.debug) {
        console.log('✅ API Response:', data);
      }

      // 如果 API 返回了位置信息
      if (data.location) {
        // 将返回的位置字符串按空格分割成数组
        const locations = data.location.split(' ').filter(loc => loc.trim());
        
        if (this.debug) {
          console.log('📊 Locations found:', locations);
        }

        return locations.length > 0 ? locations : ['Unknown Location'];
      }

      return ['Unknown Location'];

    } catch (error) {
      console.error('❌ Error extracting locations:', error);
      return ['Unknown Location'];
    }
  }

  // 设置 API URL（可选，用于配置不同环境）
  setApiUrl(url) {
    this.apiUrl = url;
  }

  // 启用或禁用调试模式
  setDebug(enabled) {
    this.debug = enabled;
  }
}