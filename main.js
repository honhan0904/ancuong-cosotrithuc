document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const body = document.body;
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
    document.querySelector('.header').appendChild(themeToggle);

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'light' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.querySelector('.theme-icon').textContent = newTheme === 'light' ? '☀️' : '🌙';
    });

    // Simulate page loading
    const loadingBar = document.getElementById('loading-bar');
    let width = 0;
    const loadingInterval = setInterval(function() {
        if (width >= 100) {
            clearInterval(loadingInterval);
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.style.opacity = '0';
            }, 500);
        } else {
            width += Math.random() * 10;
            loadingBar.style.width = Math.min(width, 100) + '%';
        }
    }, 100);
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Folder toggle handling
    const folderToggles = document.querySelectorAll('.folder-toggle');
    
    folderToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentItem = this.parentElement;
            const subfolder = parentItem.querySelector('.subfolder');
            const collapseIcon = this.querySelector('.collapse-icon');
            
            const isSearching = document.body.classList.contains('is-searching');
            
            if (parentItem.classList.contains('folder-collapsed')) {
                parentItem.classList.remove('folder-collapsed');
                collapseIcon.textContent = '-';
                collapseIcon.style.transform = 'rotate(180deg)';
                
                if (subfolder) {
                    subfolder.style.display = 'block';
                    subfolder.style.animation = 'expandIn 0.4s ease forwards';
                    if (isSearching) {
                        subfolder.querySelectorAll('.toc-item').forEach(item => {
                            item.style.display = '';  // Show all items
                        });
                    }
                }
            } else {
                parentItem.classList.add('folder-collapsed');
                collapseIcon.textContent = '+';
                collapseIcon.style.transform = 'rotate(0deg)';
                
                if (subfolder) {
                    subfolder.style.animation = 'collapseOut 0.4s ease forwards';
                    setTimeout(() => {
                        if (parentItem.classList.contains('folder-collapsed')) {
                            subfolder.style.display = 'none';
                        }
                    }, 400);
                }
            }
            
            this.querySelector('.toc-icon').style.animation = 'iconPulse 0.5s ease';
        });
    });
    
    // Handle View All button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-all-btn')) {
            e.preventDefault();
            const parentItem = e.target.closest('.toc-item');  // Get the parent item
            expandAllSubfolders(parentItem);  // Call recursive function
        }
    });
    
    function expandAllSubfolders(item) {
        const subfolder = item.querySelector('.subfolder');
        if (subfolder) {
            subfolder.style.display = 'block';
            subfolder.style.animation = 'expandIn 0.4s ease forwards';
            // Find all sub-items and expand them recursively
            const subItems = subfolder.querySelectorAll('.toc-item.folder-collapsed');
            subItems.forEach(subItem => {
                subItem.classList.remove('folder-collapsed');
                const subCollapseIcon = subItem.querySelector('.collapse-icon');
                if (subCollapseIcon) {
                    subCollapseIcon.textContent = '-';
                    subCollapseIcon.style.transform = 'rotate(180deg)';
                }
                expandAllSubfolders(subItem);  // Recursive call
            });
        }
    }
    
    // Ripple effect
    document.addEventListener('click', function(e) {
        if (e.target.closest('.toc-link')) {
            const link = e.target.closest('.toc-link');
            const ripple = document.createElement('div');
            const rect = link.getBoundingClientRect();
            
            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            
            link.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
    
    // Highlight active item when clicked
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (!this.classList.contains('folder-toggle')) {
                tocLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Department badge click handling
    const departmentBadges = document.querySelectorAll('.department-badge');
    
    departmentBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            const departmentName = this.textContent.trim();
            const searchInput = document.getElementById('search-input');
            searchInput.value = departmentName;
            searchInput.focus();
            
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
            
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    });
    
    // Enhanced search functionality
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        loadingBar.style.opacity = '1';
        loadingBar.style.width = '70%';
        
        const searchValue = this.value.toLowerCase().trim();
        const allItems = document.querySelectorAll('.toc-item, .catalogue-section');
        let foundItems = 0;
        
        document.body.classList.toggle('is-searching', searchValue !== '');
        
        setTimeout(() => {
            document.querySelectorAll('.toc-title, .toc-desc, .catalogue-link, .catalogue-title, .showroom-link').forEach(el => {
                el.style.backgroundColor = ''; // Remove highlight
                el.style.padding = '';
                el.style.borderRadius = '';
                el.style.animation = '';
            });

            function checkElementMatch(element) {
                const titleEl = element.querySelector('.toc-title, .catalogue-title');
                const descEl = element.querySelector('.toc-desc');
                const links = element.querySelectorAll('.catalogue-link, .showroom-link');
                
                let matches = false;
                
                if (searchValue && titleEl && titleEl.textContent.toLowerCase().includes(searchValue)) {
                    matches = true;
                }
                
                if (searchValue && descEl && descEl.textContent.toLowerCase().includes(searchValue)) {
                    matches = true;
                }
                
                if (searchValue) {
                    links.forEach(link => {
                        if (link.textContent.toLowerCase().includes(searchValue)) {
                            matches = true;
                        }
                    });
                }
                
                return matches;
            }

            function showParentFolders(element) {
                let parent = element.closest('.subfolder');
                while (parent) {
                    const parentItem = parent.parentElement;
                    if (parentItem.classList.contains('folder-collapsed')) {
                        parentItem.classList.remove('folder-collapsed');
                        const collapseIcon = parentItem.querySelector('.collapse-icon');
                        if (collapseIcon) collapseIcon.textContent = '-';
                    }
                    parent = parentItem.closest('.subfolder');
                }
            }

            allItems.forEach(item => {
                item.style.display = '';
                item.style.animation = '';
            });

            if (searchValue) {
                allItems.forEach(item => {
                    const hasMatch = checkElementMatch(item);
                    const hasChildMatch = Array.from(item.querySelectorAll('.toc-item, .catalogue-section, .catalogue-link, .showroom-link'))
                        .some(child => checkElementMatch(child));

                    if (hasMatch || hasChildMatch) {
                        item.style.display = '';
                        foundItems++;
                        showParentFolders(item);
                        
                        if (hasMatch) {
                            item.querySelectorAll('.toc-item, .catalogue-section, .catalogue-link, .showroom-link')
                                .forEach(child => child.style.display = '');
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });

                const visibleItems = document.querySelectorAll('.toc-item:not([style*="display: none"])');
                visibleItems.forEach((item, index) => {
                    item.style.animation = `fadeSlideIn 0.3s ease forwards ${index * 0.05}s`;
                });
            } else {
                document.querySelectorAll('.folder-toggle').forEach(toggle => {
                    const parentItem = toggle.parentElement;
                    parentItem.classList.add('folder-collapsed');
                    const collapseIcon = toggle.querySelector('.collapse-icon');
                    if (collapseIcon) collapseIcon.textContent = '+';
                });

                document.querySelectorAll('.toc-item').forEach(item => {
                    item.style.animation = '';
                });
            }

            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.style.opacity = '0';
            }, 500);
        }, 300);
    });
    
    // Handle link clicks with loading indicator
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        if ((target.tagName === 'A' && target.getAttribute('href') && !target.classList.contains('folder-toggle')) || 
            target.closest('a:not(.folder-toggle)[href]')) {
            
            const link = target.tagName === 'A' ? target : target.closest('a');
            const href = link.getAttribute('href');
            
            if (href && !href.startsWith('#')) {
                loadingBar.style.opacity = '1';
                loadingBar.style.width = '50%';
                
                let width = 50;
                const loadInterval = setInterval(function() {
                    if (width >= 80) {
                        clearInterval(loadInterval);
                    } else {
                        width += Math.random() * 5;
                        loadingBar.style.width = width + '%';
                    }
                }, 100);
            }
        }
    });

    // Enhanced security measures
    document.addEventListener('contextmenu', (e) => e.preventDefault());  // Disable right-click

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4' || e.key === 'F5' || e.key === 'F6' || e.key === 'F7' || e.key === 'F8' || e.key === 'F9' || e.key === 'F10' || e.key === 'F11' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
            (e.ctrlKey && e.key === 'U') || 
            (e.ctrlKey && e.key === 'S')
        ) {
            e.preventDefault();
        }
    });

    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());

    try {
        window.console.log = function() { return false; };
        window.console.debug = function() { return false; };
        window.console.info = function() { return false; };
        window.console.warn = function() { return false; };
        window.console.error = function() { return false; };
    } catch (e) {}
});