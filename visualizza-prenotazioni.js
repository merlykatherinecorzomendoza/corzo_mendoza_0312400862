const API_URL = 'http://127.0.0.1:5000/bookings';
let bookings = [];  // Definisci la variabile bookings qui
let editingBookingId = null;

// Funzione per modificare una prenotazione
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        // Pre-popolare i dati in un modulo o finestra modale
        alert(`Modifica prenotazione: ${booking.name}`);
        // Puoi usare un modulo per aggiornare questi dati
    }
}

// Imposta la data minima al giorno corrente
const today = new Date().toISOString().split('T')[0];
document.getElementById('edit-date').setAttribute('min', today);

// Funzione per validare la mail
function validateMail(mail) {
    const mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return mailRegex.test(mail);
}

// Funzione per validare il numero di telefono
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/;  // Supporta sia numeri con che senza trattini
    return phoneRegex.test(phone);
}

// Funzione per validare la data e l'orario
function validateDateTime(time, date) {
  const lunchTimes = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  const dinnerTimes = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
  // Verifica se la data è quella odierna
  const now = new Date();
  const selectedDate = new Date(date);
  const isToday = selectedDate.toDateString() === now.toDateString();
  // Funzione per convertire l'orario in minuti
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  // Se la data è quella odierna, controlla l'orario
  if (isToday) {
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();  // Orario attuale in minuti
    const selectedTimeInMinutes = timeToMinutes(time);
    if (selectedTimeInMinutes <= currentTimeInMinutes) {
      alert("La fascia oraria selezionata è già passata.");
      return false;  // L'orario è già passato, impedisci la prenotazione
    }
  }
  // Verifica che l'orario appartenga alle fasce disponibili
  if (lunchTimes.includes(time)) {
    alert("Hai selezionato una fascia oraria per il pranzo.");
  } else if (dinnerTimes.includes(time)) {
    alert("Hai selezionato una fascia oraria per la cena.");
  }
  return true;  // La validazione è passata
}

// Funzione per modificare una prenotazione
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        editingBookingId = id;  // Salva l'ID della prenotazione da modificare
        // Pre-compila i campi della modale
        document.getElementById('edit-name').value = booking.name;
        document.getElementById('edit-mail').value = booking.mail;
        document.getElementById('edit-phone').value = booking.phone;
        document.getElementById('edit-date').value = booking.date;
        document.getElementById('edit-time').value = booking.time;
        document.getElementById('edit-guests').value = booking.guests;
        document.getElementById('edit-notes').value = booking.notes;
        // Mostra la modale Bootstrap
        const editModal = new bootstrap.Modal(document.getElementById('editBookingModal'));
        editModal.show();
    }
}

// Funzione per inviare la modifica
document.getElementById('save-edit').addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value;
    const mail = document.getElementById('edit-mail').value;
    const phone = document.getElementById('edit-phone').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const guests = document.getElementById('edit-guests').value;
    const notes = document.getElementById('edit-notes').value;

    if (guests > 6) {
        alert("Non è possibile prenotare da questo sistema per più di 6 persone. Per gruppi più numerosi di 6 persone vi invitiamo a telefonarci.");
        return;
    }
    
    const originalBooking = bookings.find(b => b.id === editingBookingId);
    if (originalBooking && 
        originalBooking.name === name && 
        originalBooking.mail === mail && 
        originalBooking.phone === phone && 
        originalBooking.date === date && 
        originalBooking.time === time && 
        originalBooking.guests === guests && 
        originalBooking.notes === notes) {
        alert("Non ci sono modifiche da salvare.");
        return;  // Se non ci sono modifiche, non fare nulla
    }

    // Validazione mail e numero di telefono
    if (!validateMail(mail)) {
        return;  // Se la validazione fallisce, non proseguire
    }
    if (!validatePhone(phone)) {
        return;  // Se la validazione fallisce, non proseguire
    }

    // Validazione orario e data
    if (!validateDateTime(time, date)) {
        return;  // Se la validazione fallisce, non proseguire
    }

    // Invia le modifiche al backend
    await fetch(`${API_URL}/${editingBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, phone, date, time, guests, notes }),
    });

    alert("Abbiamo inviato una mail di conferma all'indirizzo: " + mail + ".");

    // Ricarica le prenotazioni e chiudi la modale
    fetchBookings();
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'));
    editModal.hide();
});

// Funzione per cancellare una prenotazione
async function deleteBooking(id) {
    const confirmDelete = confirm('Sei sicuro di voler cancellare questa prenotazione?');
    if (confirmDelete) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Prenotazione cancellata!');
            fetchBookings(); // Ricarica la lista delle prenotazioni
        } else {
            alert('Non è stato possibile cancellare la tua prenotazione. Ti preghiamo di riprovare più tardi.');
        }
    }
}

// Funzione per ottenere le prenotazioni dal backend
async function fetchBookings() {
    const response = await fetch(API_URL);
    bookings = await response.json();  // Popola la variabile bookings con i dati del backend
    const bookingList = document.getElementById('prenotazioni-list');
    bookingList.innerHTML = '';  // Resetta la lista prima di aggiungere nuove prenotazioni
    if (bookings.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" class="text-center">Non hai prenotazioni</td>`;
    bookingList.appendChild(tr);
    } else {
        bookings.forEach(booking => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td><strong>${booking.name}</strong></td>
            <td>${booking.mail}</td>
            <td>${booking.phone}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>${booking.guests}</td>
            <td>${booking.notes}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editBooking(${booking.id})">Modifica</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBooking(${booking.id})">Cancella</button>
            </td>
            `;
            bookingList.appendChild(tr);
        });
    }
}

// Carica le prenotazioni al caricamento della pagina
document.addEventListener('DOMContentLoaded', fetchBookings);