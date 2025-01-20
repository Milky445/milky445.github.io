document.getElementById('goToAbout').addEventListener('click', function() {
    document.getElementById('aboutme').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('goToProjects').addEventListener('click', function() {
    document.getElementById('myprojects').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('goToContact').addEventListener('click', function() {
    document.getElementById('contactme').scrollIntoView({ behavior: 'smooth' });
});