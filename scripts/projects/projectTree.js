class ProjectTree {
  constructor() {
    this.projects = [];
    this.expandedProjectId = null;

    // Define category structure
    this.categories = {
      psychology: { label: 'Psychology', parent: null },
      neuroscience: { label: 'Neuroscience', parent: null },
      ml: { label: 'Machine Learning', parent: null },
      geospatial: { label: 'Geospatial', parent: null },
      models: { label: 'Models', parent: 'ml' },
      xai: { label: 'XAI', parent: 'ml' }
    };
  }

  async init() {
    const projectLoader = new ProjectLoader();
    await projectLoader.loadProjectConfig();

    const projectPromises = projectLoader.projectFiles.map(projectConfig =>
      projectLoader.loadProjectData(projectConfig)
    );
    this.projects = (await Promise.all(projectPromises))
      .filter(project => project !== null);

    // Sort by status
    this.projects = projectLoader.sortProjects(this.projects);

    this.render();
    this.attachEventListeners();

    // Redraw lines on window resize
    window.addEventListener('resize', () => {
      this.positionCardsUnderCategories();
      this.drawLines();
    });
  }

  render() {
    const container = document.querySelector('.project-tree-container');
    if (!container) return;

    // Sort projects by category order so they cluster under their categories
    const sortedProjects = this.sortProjectsByCategory();

    // Create structure: categories at top, all projects in shared row below
    container.innerHTML = `
      <div class="tree-header">
        <h1 class="projects-heading" id="projects-heading">PROJECTS</h1>
      </div>
      <div class="category-row">
        ${this.renderCategoryRow()}
      </div>
      <div class="projects-row">
        ${sortedProjects.map(project => this.renderProjectCard(project)).join('')}
      </div>
      <svg class="connection-lines" id="connection-lines"></svg>
    `;

    // After DOM is ready, calculate dynamic positions and draw lines
    requestAnimationFrame(() => {
      this.positionCardsUnderCategories();
      this.drawLines();
    });
  }

  sortProjectsByCategory() {
    // Define category order: psychology, neuroscience, models, xai, geospatial
    const categoryOrder = {
      'psychology': 1,
      'neuroscience': 2,
      'models': 3,
      'xai': 4,
      'geospatial': 5
    };

    return [...this.projects].sort((a, b) => {
      // Get primary category (first in array)
      const aCat = a.categories[0] || '';
      const bCat = b.categories[0] || '';

      const aOrder = categoryOrder[aCat] || 999;
      const bOrder = categoryOrder[bCat] || 999;

      return aOrder - bOrder;
    });
  }

  renderCategoryRow() {
    // Render categories: Psychology, Neuroscience, ML (with Models/XAI as children), Geospatial
    const topCategories = ['psychology', 'neuroscience', 'ml', 'geospatial'];

    return topCategories.map(categoryKey => {
      const category = this.categories[categoryKey];
      if (!category) return '';

      if (categoryKey === 'ml') {
        // ML has subcategories
        return `
          <div class="category-group">
            <div class="parent-category-label">Machine Learning</div>
            <div class="subcategory-row">
              <div class="category-label subcategory" data-category="models">Models</div>
              <div class="category-label subcategory" data-category="xai">XAI</div>
            </div>
          </div>
        `;
      } else {
        return `<div class="category-label" data-category="${categoryKey}">${category.label}</div>`;
      }
    }).join('');
  }

  renderProjectCard(project) {
    const statusClass = `status-${project.status}`;
    const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1);

    // Always render collapsed by default - expansion handled by updateCardPositions
    return `
      <div class="project-card-tree"
           data-project-id="${project.id}"
           data-categories="${project.categories.join(',')}">
        <div class="project-thumbnail-tree"
             style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${project.image}');">
          <span class="project-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="project-content-tree">
          <h3 class="project-title-tree">${project.title}</h3>
        </div>
      </div>
    `;
  }

  positionCardsUnderCategories() {
    // No manual positioning needed - flexbox handles layout
    // This method is kept for the window resize listener but does nothing
  }

  getOrganicPosition(project) {
    // Initial placeholder positions - will be overridden by positionCardsUnderCategories()
    return { x: '50%', y: 30 };
  }


  drawLines() {
    const svg = document.getElementById('connection-lines');
    if (!svg) return;

    const container = document.querySelector('.project-tree-container');

    // Set SVG to cover entire container with some extra padding
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';

    // Clear existing lines
    svg.innerHTML = '';

    // Draw lines from PROJECTS heading to categories
    this.drawHeadingToCategories(svg, container);

    // Draw lines from ML to its subcategories
    this.drawMLToSubcategories(svg, container);

    // Draw lines from projects to their categories
    this.drawProjectsToCategories(svg, container);
  }

  drawHeadingToCategories(svg, container) {
    const heading = document.getElementById('projects-heading');
    if (!heading) return;

    const headingRect = heading.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const startX = headingRect.left + headingRect.width / 2 - containerRect.left;
    const startY = headingRect.bottom - containerRect.top;

    // Get all top-level category labels (not subcategories)
    const categoryLabels = document.querySelectorAll('.category-row > .category-label, .category-row .parent-category-label');

    categoryLabels.forEach(label => {
      const labelRect = label.getBoundingClientRect();
      const endX = labelRect.left + labelRect.width / 2 - containerRect.left;
      const endY = labelRect.top - containerRect.top;

      this.createLine(svg, startX, startY, endX, endY, 'heading-line');
    });
  }

  drawMLToSubcategories(svg, container) {
    // Draw lines from "Machine Learning" parent to Models and XAI
    const parentLabel = document.querySelector('.parent-category-label');
    const subcategoryLabels = document.querySelectorAll('.subcategory');

    if (!parentLabel || subcategoryLabels.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const parentRect = parentLabel.getBoundingClientRect();

    const startX = parentRect.left + parentRect.width / 2 - containerRect.left;
    const startY = parentRect.bottom - containerRect.top;

    subcategoryLabels.forEach(subcatLabel => {
      const subcatRect = subcatLabel.getBoundingClientRect();
      const endX = subcatRect.left + subcatRect.width / 2 - containerRect.left;
      const endY = subcatRect.top - containerRect.top;

      this.createLine(svg, startX, startY, endX, endY, 'subcategory-line');
    });
  }

  drawProjectsToCategories(svg, container) {
    const containerRect = container.getBoundingClientRect();
    const projectCards = document.querySelectorAll('.project-card-tree');

    projectCards.forEach(card => {
      const categories = card.dataset.categories.split(',').filter(c => c);
      const cardRect = card.getBoundingClientRect();

      // Start from top center of card
      const startX = cardRect.left + cardRect.width / 2 - containerRect.left;
      const startY = cardRect.top - containerRect.top;

      categories.forEach(categoryKey => {
        // Find the category label
        const categoryLabel = document.querySelector(`.category-label[data-category="${categoryKey}"]`);
        if (!categoryLabel) return;

        const labelRect = categoryLabel.getBoundingClientRect();
        const endX = labelRect.left + labelRect.width / 2 - containerRect.left;
        const endY = labelRect.bottom - containerRect.top;

        // Draw diagonal line from card up to category
        this.createLine(svg, startX, startY, endX, endY, 'project-line');
      });
    });
  }

  createLine(svg, x1, y1, x2, y2, className = '') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', className);
    svg.appendChild(line);
  }

  attachEventListeners() {
    const projectCards = document.querySelectorAll('.project-card-tree');

    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = card.dataset.projectId;

        // Toggle expansion
        if (this.expandedProjectId === projectId) {
          this.expandedProjectId = null;
        } else {
          this.expandedProjectId = projectId;
        }

        this.updateCardPositions();
      });
    });
  }

  updateCardPositions() {
    // Instead of re-rendering, just update classes and apply displacement
    const allCards = document.querySelectorAll('.project-card-tree');
    const expandedCard = document.querySelector(`.project-card-tree[data-project-id="${this.expandedProjectId}"]`);

    allCards.forEach(card => {
      const cardId = card.dataset.projectId;

      // Update expanded class
      if (cardId === this.expandedProjectId) {
        card.classList.add('expanded');
        // Update content to show description and tags
        const project = this.projects.find(p => p.id === cardId);
        if (project) {
          const contentDiv = card.querySelector('.project-content-tree');
          contentDiv.innerHTML = `
            <h3 class="project-title-tree">${project.title}</h3>
            <p class="project-description-tree">${project.description || ''}</p>
            <div class="project-tags-tree">
              ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          `;
        }
      } else {
        card.classList.remove('expanded');
        // Reset to collapsed content
        const project = this.projects.find(p => p.id === cardId);
        if (project) {
          const contentDiv = card.querySelector('.project-content-tree');
          contentDiv.innerHTML = `<h3 class="project-title-tree">${project.title}</h3>`;
        }
      }

      // Apply displacement if there's an expanded card
      if (expandedCard && cardId !== this.expandedProjectId) {
        this.applyDisplacement(card, expandedCard);
      } else {
        // Reset transform
        card.style.transform = '';
      }
    });

    // Redraw lines with new positions
    requestAnimationFrame(() => this.drawLines());
  }

  applyDisplacement(card, expandedCard) {
    const cardRect = card.getBoundingClientRect();
    const expandedRect = expandedCard.getBoundingClientRect();

    // Calculate distance between cards
    const dx = cardRect.left - expandedRect.left;
    const dy = cardRect.top - expandedRect.top;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only displace if within 300px radius
    if (distance < 300 && distance > 0) {
      // Calculate displacement vector (push away from expanded card)
      const angle = Math.atan2(dy, dx);
      const pushDistance = Math.max(0, 60 - (distance / 5)); // Stronger push for closer cards

      const translateX = Math.cos(angle) * pushDistance;
      const translateY = Math.sin(angle) * pushDistance;

      card.style.transform = `translate(${translateX}px, ${translateY}px)`;
    } else {
      card.style.transform = '';
    }
  }
}

// Initialize tree on page load
document.addEventListener('DOMContentLoaded', async function() {
  const treeContainer = document.querySelector('.project-tree-container');
  if (treeContainer) {
    const projectTree = new ProjectTree();
    await projectTree.init();
  }
});
