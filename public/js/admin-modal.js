// Modal functionality
const logoutModal = document.getElementById('logoutModal');
const closeBtns = document.querySelectorAll('.close');

function showLogoutModal(event) {
    if (event) event.preventDefault();
    logoutModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target === logoutModal) {
        closeModal('logoutModal');
    }
};

// Close modals when clicking X
closeBtns.forEach(btn => {
    btn.onclick = function() {
        const modalId = this.closest('.modal').id;
        closeModal(modalId);
    };
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && logoutModal.classList.contains('show')) {
        closeModal('logoutModal');
    }
});

async function confirmLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            closeModal('logoutModal');
            window.location.href = '/';
        } else {
            const data = await response.json();
            alert(data.message || 'Error logging out');
        }
    } catch (error) {
        alert('Error logging out');
        console.error('Error:', error);
    }
}
