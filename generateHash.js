const bcrypt = require('bcryptjs');

// --- Primer Usuario ---
const passwordOriginal1 = 'paolacardozo'; 
const saltRounds1 = 10;
bcrypt.hash(passwordOriginal1, saltRounds1, function(err, hashedPassword1) {
    if (err) { console.error('Error al generar hash 1:', err); return; }
    console.log('Usuario 1 (para la DB):', hashedPassword1);
});

// --- Segundo Usuario ---
const passwordOriginal2 = 'lucianahaedo'; 
const saltRounds2 = 10;
bcrypt.hash(passwordOriginal2, saltRounds2, function(err, hashedPassword2) {
    if (err) { console.error('Error al generar hash 2:', err); return; }
    console.log('Usuario 2 (para la DB):', hashedPassword2);
});

// --- Tercer Usuario ---
const passwordOriginal3 = 'jorgecarrion';
const saltRounds3 = 10;
bcrypt.hash(passwordOriginal3, saltRounds3, function(err, hashedPassword3) {
    if (err) { console.error('Error al generar hash 3:', err); return; }
    console.log('Usuario 3 (para la DB):', hashedPassword3);
});