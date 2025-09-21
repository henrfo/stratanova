// Project Image Synchronization
// This script uses CSS custom properties to sync project images
// Simply define a CSS variable for each project and everything syncs automatically!

// Project image URLs - define once, use everywhere
const projectImages = {
  'biomarkers-cognitive-training': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'hippocampal-memory-models': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'seeg-analysis': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  'neuroshap': 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
};

// Function to set up CSS custom properties for project images
function setupProjectImages() {
  const root = document.documentElement;
  
  // Set CSS variables for each project
  for (const [projectKey, imageUrl] of Object.entries(projectImages)) {
    root.style.setProperty(`--${projectKey}-image`, `url('${imageUrl}')`);
  }
  
  // Also set up hero background if we're on a project page
  const currentPage = window.location.pathname;
  const projectName = currentPage.split('/').pop()?.replace('.html', '');
  
  if (projectName && projectImages[projectName]) {
    const projectHero = document.querySelector('.project-hero');
    if (projectHero) {
      projectHero.style.background = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${projectImages[projectName]}')`;
      projectHero.style.backgroundSize = 'cover';
      projectHero.style.backgroundPosition = 'center';
    }
  }
}

// Function to apply images to project cards
function syncProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    const href = card.getAttribute('href');
    if (href) {
      // Extract project name from href (e.g., "projects/neuroshap.html" -> "neuroshap")
      const projectName = href.replace('projects/', '').replace('.html', '');
      
      if (projectImages[projectName]) {
        const thumbnail = card.querySelector('.project-thumbnail');
        if (thumbnail) {
          // Use CSS variable for the background image
          thumbnail.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), var(--${projectName}-image)`;
        }
      }
    }
  });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setupProjectImages();
  syncProjectCards();
});