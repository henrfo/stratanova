// Automated Project Card Generator
// This script automatically generates project cards from project files

class ProjectLoader {
  constructor() {
    this.projectsConfig = [
      {
        id: 'biomarkers-cognitive-training',
        title: 'Bachelor Thesis: Exploring Biomarkers of Cognitive Training Responsiveness After Stroke',
        description: 'A multimodal ML approach examining relationships between brain features and cognitive training outcomes in stroke patients. Integrated structural MRI, blood biomarkers, and normative deviations to identify predictive patterns.',
        tags: ['Neuroscience', 'Stroke', 'Machine Learning'],
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
      },
      {
        id: 'hippocampal-memory-models',
        title: 'Exploring Neural Models of Hippocampal Memory',
        description: 'Simula Summer School project implementing Hopfield Networks and Kanerva Machines to model hippocampal memory functions, including pattern completion and separation mechanisms underlying spatial and episodic memory.',
        tags: ['Computational Neuroscience', 'Memory Systems', 'Neural Networks'],
        status: 'ongoing',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
      },
      {
        id: 'seeg-analysis',
        title: 'Hippocampal Circuit Dynamics in SEEG Data',
        description: 'UiO:Life Science project analyzing intracranial recordings to investigate theta oscillations in hippocampal-cortical circuits during memory processing. Building automated pipelines for neural signal analysis.',
        tags: ['Electrophysiology', 'Neural Oscillations', 'Memory Circuits'],
        status: 'ongoing',
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
      },
      {
        id: 'neuroshap',
        title: 'Master Thesis: NeuroSHAP',
        description: 'Enhancing SHAP interpretability for neuroimaging through spatial constraints and Markov Random Fields. Developing biologically-informed explanations that respect brain connectivity and regional dependencies.',
        tags: ['Interpretability', 'Neuroimaging', 'SHAP'],
        status: 'planned',
        image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
      }
    ];
    
    this.statusOrder = {
      'planned': 1,
      'ongoing': 2, 
      'completed': 3
    };
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
      <a href="projects/${project.id}.html" class="project-card">
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
    return projects.sort((a, b) => {
      return this.statusOrder[a.status] - this.statusOrder[b.status];
    });
  }

  loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Clear existing content
    projectsGrid.innerHTML = '';
    
    // Sort projects by status
    const sortedProjects = this.sortProjects(this.projectsConfig);
    
    // Generate and insert project cards
    sortedProjects.forEach(project => {
      projectsGrid.innerHTML += this.createProjectCard(project);
    });
  }

  // Method to add a new project (for easy expansion)
  addProject(projectData) {
    this.projectsConfig.push(projectData);
    this.loadProjects(); // Reload the grid
  }

  // Method to update project configuration from external source
  updateConfig(newConfig) {
    this.projectsConfig = newConfig;
    this.loadProjects();
  }
}

// Initialize and load projects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const projectLoader = new ProjectLoader();
  projectLoader.loadProjects();
  
  // Make projectLoader globally available for external configuration
  window.projectLoader = projectLoader;
});