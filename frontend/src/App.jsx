import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import Footer from './components/Footer';
import { Mic, Shield, Heart, Users, Home, Tool, Activity } from 'react-feather';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function App() {
  const [message, setMessage] = useState("");
  const [assistantHints, setAssistantHints] = useState([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState("Seguro de Auto");
  const wsRef = useRef(null);

  const captureScreen = async () => {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL("image/png");
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.start();

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      sendForAnalysis(text);
    };
    setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
  };

  const sendForAnalysis = async (text) => {
    const screenshot = await captureScreen();
    const formData = new FormData();
    formData.append("input_text", text);
    formData.append("file", dataURLtoFile(screenshot, "screenshot.png"));

    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    setMessage(`Producto: ${data.producto || "No detectado"} - Etapa: ${data.etapa || "No detectada"}`);
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    wsRef.current = new WebSocket(`${API_BASE_URL.replace("http", "ws")}/ws/assist`);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAssistantHints(prev => [...prev, data]);
    };
    return () => wsRef.current.close();
  }, []);

  const simulateQuote = async () => {
    const formData = new FormData();
    formData.append("tipo_seguro", selectedProgram);
    formData.append("monto", document.getElementById("monto").value);
    formData.append("plazo", document.getElementById("plazo").value);

    const res = await fetch(`${API_BASE_URL}/simulate`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setSimulationResult(data);
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* ===================== */}
        {/* Sección Servicios */}
        {/* ===================== */}
        <section className="services-section">
          <h2>Nuestros Servicios</h2>
          <p className="services-subtitle">Conoce las coberturas que ofrecemos para tu tranquilidad y seguridad.</p>
          <div className="services-list">
            <div className="service-item">
              <Shield size={40} color="#d32f2f" />
              <h4>Pérdida de Control</h4>
              <p>Protección ante imprevistos durante la conducción.</p>
            </div>
            <div className="service-item">
              <Heart size={40} color="#d32f2f" />
              <h4>Seguro de Vida</h4>
              <p>Respaldo económico para tus seres queridos.</p>
            </div>
            <div className="service-item">
              <Users size={40} color="#d32f2f" />
              <h4>Asesoría Personalizada</h4>
              <p>Orientación experta para elegir la mejor cobertura.</p>
            </div>
          </div>
        </section>

        {/* ===================== */}
        {/* Sección Simulación */}
        {/* ===================== */}
        <section className="simulation-section">
          <h2>Simulación de Cotización</h2>
          <p className="simulation-subtitle">Selecciona un programa y calcula tu cotización estimada.</p>

          <div className="insurance-options">
            <button
              className={`insurance-btn ${selectedProgram === "Seguro de Auto" ? 'active' : ''}`}
              onClick={() => setSelectedProgram("Seguro de Auto")}
            >
              <Tool size={18} /> Auto
            </button>
            <button
              className={`insurance-btn ${selectedProgram === "Seguro de Vida" ? 'active' : ''}`}
              onClick={() => setSelectedProgram("Seguro de Vida")}
            >
              <Heart size={18} /> Vida
            </button>
            <button
              className={`insurance-btn ${selectedProgram === "Seguro de Salud" ? 'active' : ''}`}
              onClick={() => setSelectedProgram("Seguro de Salud")}
            >
              <Activity size={18} /> Salud
            </button>
            <button
              className={`insurance-btn ${selectedProgram === "Seguro de Hogar" ? 'active' : ''}`}
              onClick={() => setSelectedProgram("Seguro de Hogar")}
            >
              <Home size={18} /> Hogar
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="monto">Monto asegurado:</label>
            <input id="monto" type="number" placeholder="Ej: 10000" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="plazo">Plazo (meses):</label>
            <input id="plazo" type="number" placeholder="Ej: 12" className="form-control" />
          </div>
          <button onClick={simulateQuote} className="simulate-button">Simular</button>

          {simulationResult && (
            <div className="simulation-result">
              <h3>Resultado de Simulación:</h3>
              <p><strong>Tipo:</strong> {simulationResult.tipo_seguro}</p>
              <p><strong>Cotización estimada:</strong> {simulationResult.cotizacion_estimativa}</p>
            </div>
          )}
        </section>

        {/* ===================== */}
        {/* Mensajes del Asistente */}
        {/* ===================== */}
        {assistantHints.length > 0 && (
          <div className="assistant-hints card">
            <h3>Sugerencias del Asistente:</h3>
            <ul>
              {assistantHints.map((hint, index) => (
                <li key={index}>{hint.message}</li>
              ))}
            </ul>
          </div>
        )}
        {message && !assistantHints.length && (
          <div className="assistant-message card">
            <h3>Mensaje del Asistente:</h3>
            <p>{message}</p>
          </div>
        )}

        {/* ===================== */}
        {/* Botón flotante de voz */}
        {/* ===================== */}
        <button
          className={`floating-button ${voiceActive ? 'active' : ''}`}
          onClick={startVoiceRecognition}
          title="Activar asistente por voz"
        >
          <Mic size={22} />
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default App;
