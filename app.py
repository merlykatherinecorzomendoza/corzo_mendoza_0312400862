from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:8080"}})

# Dati in memoria
bookings = []
booking_id = 1

# Endpoint per ottenere tutte le prenotazioni
@app.route('/bookings', methods=['GET'])
def get_bookings():
    return jsonify(bookings)

# Endpoint per creare una prenotazione
@app.route('/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    global booking_id
    new_booking = {
        "id": booking_id,
        "name": data['name'],
        "mail": data['mail'],
        "phone": data['phone'],
        "date": data['date'],
        "time": data['time'],
        "guests": data['guests'],
        "notes": data['notes']
    }
    bookings.append(new_booking)
    booking_id += 1
    return jsonify(new_booking), 201

# Endpoint per cancellare una prenotazione
@app.route('/bookings/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    global bookings
    bookings = [b for b in bookings if str(b['id']) != str(booking_id)]
    return '', 204

# Endpoint per modificare una prenotazione
@app.route('/bookings/<booking_id>', methods=['PUT'])
def update_booking(booking_id):
    data = request.get_json()
    booking = next((b for b in bookings if str(b['id']) == str(booking_id)), None)
    if not booking:
        return jsonify({"message": "Prenotazione non trovata"}), 404
    booking['name'] = data['name']
    booking['mail'] = data['mail']
    booking['phone'] = data['phone']
    booking['date'] = data['date']
    booking['time'] = data['time']
    booking['guests'] = data['guests']
    booking['notes'] = data['notes']
    return jsonify({"message": "Prenotazione aggiornata", "booking": booking}), 200

if __name__ == '__main__':
    app.run(debug=True)