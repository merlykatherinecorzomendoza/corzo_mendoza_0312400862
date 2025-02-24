document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const API_URL = 'http://127.0.0.1:5000/bookings'; // Endpoint del backend per creare una prenotazione
  
    // Imposta la data minima al giorno corrente
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
  
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
  
    // Funzione per creare una prenotazione
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const mail = document.getElementById('mail').value;
      const phone = document.getElementById('phone').value;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const guests = document.getElementById('guests').value;
      const notes = document.getElementById('notes').value;

      if (guests > 6) {
        alert("Non è possibile prenotare da questo sistema per più di 6 persone. Per gruppi più numerosi di 6 persone vi invitiamo a telefonarci.");
        return;
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

      // Chiamata al backend per creare la prenotazione
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, phone, date, time, guests, notes }),
      });
  
      if (response.ok) {
        alert('Prenotazione effettuata con successo!');
        alert("Abbiamo inviato una mail di conferma all'indirizzo: " + mail + ".");
        form.reset();  // Reset del modulo dopo la prenotazione
      } else {
        alert('Si è verificato un errore nella prenotazione. Riprova.');
      }
    });
  });