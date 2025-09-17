const filters = document.querySelectorAll('.filter');
const qureTabContainer = document.querySelector(".qure_tabs");
let lastClickedTab = null;

filters.forEach(filter => {
  filter.addEventListener('click', function () {
    // Handle tab scroll
    if (lastClickedTab && lastClickedTab !== this) {
      const containerLeft = qureTabContainer.getBoundingClientRect().left;
      const elementLeft = this.getBoundingClientRect().left;
      const offset = elementLeft - containerLeft - 10;
      qureTabContainer.scrollBy({ left: offset, behavior: "smooth" });
    } else if (!lastClickedTab) {
      const elementLeft = this.getBoundingClientRect().left;
      const containerLeft = qureTabContainer.getBoundingClientRect().left;
      const horizontalOffset = elementLeft - containerLeft;
      qureTabContainer.scrollBy({ left: horizontalOffset, behavior: "smooth" });
    }
    lastClickedTab = this;

    // Handle filter active state
    filters.forEach(f => f.classList.remove('active'));
    this.classList.add('active');

    // Filter projects
    // const selectedFilter = this.getAttribute('data-filter');
    // const allProjects = document.querySelectorAll('.projects .project');

    // allProjects.forEach(project => {
    //   const projectFilters = project.getAttribute('data-filter').split(' ');
    //   if (selectedFilter === 'all' || projectFilters.includes(selectedFilter)) {
    //     project.classList.remove('hide');
    //     project.classList.add('show');
    //   } else {
    //     project.classList.add('hide');
    //     project.classList.remove('show');
    //   }
    // });
  });
});
