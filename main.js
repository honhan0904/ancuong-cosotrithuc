document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle') || document.createElement('div');
    if (!themeToggle.parentElement) {
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-sun theme-icon"></i>';
        document.body.appendChild(themeToggle);
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('.theme-icon').className = `fas fa-${savedTheme === 'light' ? 'moon' : 'sun'} theme-icon`;

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.querySelector('.theme-icon').className = `fas fa-${newTheme === 'light' ? 'moon' : 'sun'} theme-icon`;
    });

    // Simulate page loading
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) {
        let width = 0;
        const loadingInterval = setInterval(() => {
            if (width >= 100) {
                clearInterval(loadingInterval);
                loadingBar.style.width = '100%';
                setTimeout(() => {
                    loadingBar.style.opacity = '0';
                }, 300);
            } else {
                width += Math.random() * 10;
                loadingBar.style.width = `${Math.min(width, 100)}%`;
            }
        }, 100);
    }

    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Folder toggle handling
    const folderToggles = document.querySelectorAll('.folder-toggle');
    folderToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parentItem = toggle.parentElement;
            const subfolder = parentItem.querySelector('.subfolder');
            const collapseIcon = toggle.querySelector('.collapse-icon');
            const isExpanded = !parentItem.classList.contains('folder-collapsed');

            parentItem.classList.toggle('folder-collapsed');
            collapseIcon.textContent = isExpanded ? '+' : '−';
            toggle.setAttribute('aria-expanded', !isExpanded);

            if (subfolder) {
                subfolder.style.animation = isExpanded ? 'collapseOut 0.3s ease forwards' : 'expandIn 0.3s ease forwards';
                subfolder.style.display = isExpanded ? 'block' : 'block';
                if (isExpanded) {
                    setTimeout(() => {
                        if (parentItem.classList.contains('folder-collapsed')) {
                            subfolder.style.display = 'none';
                        }
                    }, 300);
                }
            }
        });
    });

    // View All button handling
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-all-btn')) {
            e.preventDefault();
            const parentItem = e.target.closest('.toc-item');
            expandAllSubfolders(parentItem);
        }
    });

    function expandAllSubfolders(item) {
        const subfolder = item.querySelector('.subfolder');
        if (subfolder) {
            subfolder.style.display = 'block';
            subfolder.style.animation = 'expandIn 0.3s ease forwards';
            const subItems = subfolder.querySelectorAll('.toc-item.folder-collapsed');
            subItems.forEach(subItem => {
                subItem.classList.remove('folder-collapsed');
                const subCollapseIcon = subItem.querySelector('.collapse-icon');
                const subToggle = subItem.querySelector('.folder-toggle');
                if (subCollapseIcon) subCollapseIcon.textContent = '−';
                if (subToggle) subToggle.setAttribute('aria-expanded', 'true');
                expandAllSubfolders(subItem);
            });
        }
    }

    // Ripple effect
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.toc-link');
        if (link) {
            const ripple = document.createElement('div');
            const rect = link.getBoundingClientRect();
            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            link.appendChild(ripple);
            setTimeout(() => ripple.remove(), 500);
        }
    });

    // Highlight active item
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!link.classList.contains('folder-toggle')) {
                tocLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Department badge click handling
    const departmentBadges = document.querySelectorAll('.department-badge');
    departmentBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const departmentName = badge.textContent.trim();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = departmentName;
                searchInput.focus();
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                badge.style.transform = 'scale(1.1)';
                setTimeout(() => badge.style.transform = '', 200);
            }
        });
    });

    // Enhanced search functionality with debouncing
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchValue = searchInput.value.toLowerCase().trim();
                const allItems = document.querySelectorAll('.toc-item');
                let foundItems = 0;

                if (loadingBar) {
                    loadingBar.style.opacity = '1';
                    loadingBar.style.width = '70%';
                }

                // Reset display and animations
                allItems.forEach(item => {
                    item.style.display = '';
                    item.style.animation = '';
                });

                if (noResults) noResults.style.display = 'none';
                document.body.classList.toggle('is-searching', !!searchValue);

                if (searchValue) {
                    allItems.forEach(item => {
                        const titleEl = item.querySelector('.toc-title');
                        const descEl = item.querySelector('.toc-desc');
                        let matches = false;

                        // Check if the current item matches
                        if (titleEl && titleEl.textContent.toLowerCase().includes(searchValue)) {
                            matches = true;
                        }
                        if (descEl && descEl.textContent.toLowerCase().includes(searchValue)) {
                            matches = true;
                        }

                        // Check if any child items match
                        const childItems = item.querySelectorAll('.toc-item');
                        const hasChildMatch = Array.from(childItems).some(child => {
                            const childTitle = child.querySelector('.toc-title');
                            const childDesc = child.querySelector('.toc-desc');
                            return (childTitle && childTitle.textContent.toLowerCase().includes(searchValue)) ||
                                   (childDesc && childDesc.textContent.toLowerCase().includes(searchValue));
                        });

                        if (matches || hasChildMatch) {
                            item.style.display = '';
                            foundItems++;
                            // Expand parent folders
                            let parent = item.closest('.subfolder');
                            while (parent) {
                                const parentItem = parent.parentElement;
                                parentItem.classList.remove('folder-collapsed');
                                const collapseIcon = parentItem.querySelector('.collapse-icon');
                                const toggle = parentItem.querySelector('.folder-toggle');
                                if (collapseIcon) collapseIcon.textContent = '−';
                                if (toggle) toggle.setAttribute('aria-expanded', 'true');
                                const subfolder = parentItem.querySelector('.subfolder');
                                if (subfolder) subfolder.style.display = 'block';
                                parent = parentItem.closest('.subfolder');
                            }
                        } else {
                            item.style.display = 'none';
                        }
                    });

                    // Animate visible items
                    const visibleItems = document.querySelectorAll('.toc-item:not([style*="display: none"])');
                    visibleItems.forEach((item, index) => {
                        item.style.animation = `fadeSlideIn 0.3s ease forwards ${index * 0.05}s`;
                    });

                    // Show "No results" if no matches
                    if (noResults) {
                        noResults.style.display = foundItems ? 'none' : 'block';
                    }
                } else {
                    // Reset to collapsed state when search is cleared
                    folderToggles.forEach(toggle => {
                        const parentItem = toggle.parentElement;
                        parentItem.classList.add('folder-collapsed');
                        const collapseIcon = toggle.querySelector('.collapse-icon');
                        const subfolder = parentItem.querySelector('.subfolder');
                        if (collapseIcon) collapseIcon.textContent = '+';
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                        if (subfolder) {
                            subfolder.style.display = 'none';
                            subfolder.style.animation = '';
                        }
                    });
                }

                if (loadingBar) {
                    loadingBar.style.width = '100%';
                    setTimeout(() => loadingBar.style.opacity = '0', 300);
                }
            }, 300);
        });
    }

    // Handle link clicks with loading indicator
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a:not(.folder-toggle)[href]');
        if (link && loadingBar) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
                loadingBar.style.opacity = '1';
                loadingBar.style.width = '50%';
                let width = 50;
                const loadInterval = setInterval(() => {
                    if (width >= 80) {
                        clearInterval(loadInterval);
                    } else {
                        width += Math.random() * 5;
                        loadingBar.style.width = `${width}%`;
                    }
                }, 100);
            }
        }
    });

    // Minimal security measures
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.toc-link, .search-box, .theme-toggle, .back-to-top')) {
            e.preventDefault();
        }
    });
});