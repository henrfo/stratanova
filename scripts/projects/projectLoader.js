class ProjectLoader {
  constructor() {
    this.projectFiles = [];
  }

  async loadProjectConfig() {
    try {
      const response = await fetch('scripts/projects/projects-list.json');
      const config = await response.json();
      this.projectFiles = config.projects;
    } catch (error) {
      this.projectFiles = [];
    }
  }

  async loadProjectData(filename) {
    try {
      const response = await fetch(`projects/${filename}`);
      if (!response.ok) return null;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract data from existing HTML structure
      const title = doc.querySelector('.project-hero h1')?.textContent?.trim();
      const statusElement = doc.querySelector('.meta-value');
      const status = statusElement?.textContent?.toLowerCase()?.trim();
      const tags = Array.from(doc.querySelectorAll('.project-tags .tag')).map(
        tag => tag.textContent.trim()
      );
      
      // Extract first paragraph as description
      const description = doc.querySelector('.project-section p')?.textContent?.trim();
      
      // Extract filename as ID (remove .html extension)
      const id = filename.replace('.html', '');
      
      return {
        id: id,
        title: title,
        description: description,
        status: status,
        image: this.getProjectImage(id),
        tags: tags
      };
    } catch (error) {
      return null;
    }
  }

  getProjectImage(id) {
    const imageMap = {
      'biomarkers-cognitive-training': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'hippocampal-memory-models': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'seeg-analysis': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      'neuroshap': 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
    };
    return imageMap[id] || '';
  }

  getStatusClass(status) {
    return `status-${status}`;
  }

  getStatusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  createProjectCard(project) {
    const statusClass = this.getStatusClass(project.status);
    const statusLabel = this.getStatusLabel(project.status);
    
    return `
      <a href="projects/${project.id}" class="project-card">
        <div class="project-thumbnail" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${project.image}');">
          <span class="project-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="project-content">
          <h2 class="project-title">${project.title}</h2>
          <p class="project-pitch">
            ${project.description}
          </p>
          <div class="project-tags">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <span class="view-more">View full project</span>
        </div>
      </a>
    `;
  }

  sortProjects(projects) {
    const statusOrder = {
      'planned': 1,
      'ongoing': 2, 
      'completed': 3
    };
    return projects.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }

  async loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    await this.loadProjectConfig();
    
    const projectPromises = this.projectFiles.map(filename => this.loadProjectData(filename));
    const projects = await Promise.all(projectPromises);
    const validProjects = projects.filter(project => project !== null);
    
    // Sort projects by status
    const sortedProjects = this.sortProjects(validProjects);
    
    projectsGrid.innerHTML = '';
    sortedProjects.forEach(project => {
      projectsGrid.innerHTML += this.createProjectCard(project);
    });
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const projectLoader = new ProjectLoader();
  await projectLoader.loadProjects();
});