import { useState } from "react";
import { addLocation } from "./lib/firestoreService";
import Background from "./Background.jsx";
import "./App.css";

export default function LocationGate({ onDone }) {
  const [form, setForm] = useState({ place: "", buildingType: "Home", lat: "", lng: "" });

  const submitLocation = async (e) => {
    e.preventDefault();
    const lat = parseFloat(form.lat), lng = parseFloat(form.lng);
    if (!form.place || isNaN(lat) || isNaN(lng)) return;
    await addLocation({ place: form.place, buildingType: form.buildingType, lat, lng });
    onDone();
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation is not supported in this browser."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
      (err) => alert("Failed to get automatic location (" + err.message + "). Please enter it manually.")
    );
  };

  return (
    <div className="ops-deck login-deck">
      <Background />
      <div className="login-card">
        <div className="login-brand">RAY<span>.OS</span></div>
        <p className="login-sub">Location Check-in</p>
        <form onSubmit={submitLocation}>
          <div className="modal-field">
            <label>LOCATION (PLACE NAME)</label>
            <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="e.g. Home, Cafe XYZ" required />
          </div>
          <div className="modal-field">
            <label>BUILDING TYPE</label>
            <select value={form.buildingType} onChange={(e) => setForm({ ...form, buildingType: e.target.value })}>
              <option>Home</option>
              <option>Cafe/Coworking</option>
              <option>Client Office</option>
              <option>Vilacation Site</option>
              <option>Other</option>
            </select>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>LATITUDE</label>
              <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="-7.7956" required />
            </div>
            <div className="modal-field">
              <label>LONGITUDE</label>
              <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="110.3695" required />
            </div>
          </div>
          <button type="button" className="modal-geo-btn" onClick={useCurrentLocation}>Use current location</button>
          <button type="submit" className="modal-submit">Save &amp; Continue</button>
        </form>
      </div>
    </div>
  );
}
