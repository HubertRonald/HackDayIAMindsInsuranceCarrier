import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function App() {
  const [message, setMessage] = useState("");
  const [assistantHints, setAssistantHints] = useState([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const wsRef = useRef(null);

  // --- 1️⃣ Captura pantalla ---
  const captureScreen = async () => {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL("image/png");
  };

  // --- 2️⃣ Activación por voz ---
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

  // --- 3️⃣ Enviar texto + screenshot al backend ---
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
    speakText(`Parece que estás en la etapa ${data.etapa} para el producto ${data.producto}`);
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  // --- 4️⃣ WebSocket ---
  useEffect(() => {
    wsRef.current = new WebSocket(`${API_BASE_URL.replace("http", "ws")}/ws/assist`);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAssistantHints(prev => [...prev, data]);
      if (data.action === "highlight" && data.selector) {
        const element = document.querySelector(data.selector);
        if (element) {
          element.classList.add("highlight");
          element.title = data.message;
        }
      }
    };
    return () => wsRef.current.close();
  }, []);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    synth.speak(utterance);
  };

  // --- 5️⃣ Simulación de cotización ---
  const simulateQuote = async () => {
    const formData = new FormData();
    formData.append("tipo_seguro", document.getElementById("tipo_seguro").value);
    formData.append("monto", document.getElementById("monto").value);
    formData.append("plazo", document.getElementById("plazo").value);

    const res = await fetch(`${API_BASE_URL}/simulate`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setSimulationResult(data);
    speakText(`La cotización estimada es de ${data.cotizacion_estimativa} dólares.`);
  };

  return (
    <div>
      <h1>💡 HackDay Gemini Assistant</h1>
      <button onClick={startVoiceRecognition}>
        {voiceActive ? "🎙️ Escuchando..." : "🎤 Activar Asistente por Voz"}
      </button>
      <p>{message}</p>

      <div>
        <h2>Simulación de Cotización</h2>
        <label>Tipo de seguro: </label>
        <select id="tipo_seguro">
          <option value="auto">Auto</option>
          <option value="vida">Vida</option>
          <option value="salud">Salud</option>
          <option value="hogar">Hogar</option>
        </select>
        <br/>
        <label>Monto asegurado: </label>
        <input id="monto" type="number" placeholder="Ej: 10000"/>
        <br/>
        <label>Plazo (meses): </label>
        <input id="plazo" type="number" placeholder="Ej: 12"/>
        <br/>
        <button onClick={simulateQuote}>Simular</button>

        {simulationResult && (
          <div>
            <h3>Resultado:</h3>
            <p>Tipo: {simulationResult.tipo_seguro}</p>
            <p>Cotización estimada: {simulationResult.cotizacion_estimativa}</p>
          </div>
        )}
      </div>

      <h2>Asistente Visual:</h2>
      <ul>
        {assistantHints.map((hint, index) => (
          <li key={index}>{hint.message}</li>
        ))}
      </ul>

      <style>{`
        .highlight {
          border: 2px solid orange !important;
          background-color: #fff4e1 !important;
        }
      `}</style>
    </div>
  );
}

export default App;
