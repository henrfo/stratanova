class ServiceLoader {
  constructor() {
    this.serviceFiles = [];
  }

  async loadServiceConfig() {
    try {
      const response = await fetch('scripts/services/services-list.json');
      const config = await response.json();
      this.serviceFiles = config.services;
    } catch (error) {
      this.serviceFiles = [];
    }
  }

  async loadServiceData(filename) {
    try {
      const response = await fetch(`scripts/services/${filename}`);
      if (!response.ok) return null;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const serviceData = doc.querySelector('.service-data');
      
      if (!serviceData) return null;
      
      const features = Array.from(serviceData.querySelectorAll('.feature')).map(
        feature => feature.textContent.trim()
      );
      
      return {
        title: serviceData.getAttribute('data-title'),
        description: serviceData.getAttribute('data-description'),
        icon: serviceData.getAttribute('data-icon'),
        features: features
      };
    } catch (error) {
      return null;
    }
  }


  createServiceCard(service) {
    return `
      <div class="service-card">
        <div class="service-icon-area">
          <i class="fas ${service.icon} service-icon"></i>
        </div>
        <div class="service-content">
          <h2 class="service-name">${service.title}</h2>
          <p class="service-description">
            ${service.description}
          </p>
          <div class="service-features">
            <ul>
              ${service.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  async loadServices() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    await this.loadServiceConfig();
    
    const servicePromises = this.serviceFiles.map(filename => this.loadServiceData(filename));
    const services = await Promise.all(servicePromises);
    const validServices = services.filter(service => service !== null);
    
    servicesGrid.innerHTML = '';
    validServices.forEach(service => {
      servicesGrid.innerHTML += this.createServiceCard(service);
    });
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const serviceLoader = new ServiceLoader();
  await serviceLoader.loadServices();
});