from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import os

app = Flask(__name__)
CORS(app, resources={r"/analyze": {"origins": "http://localhost:5173"}})  # ✅ Allow only frontend requests

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['audio']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    waveform, sr = librosa.load(filepath, sr=None)
    chroma = librosa.feature.chroma_cqt(y=waveform, sr=sr, bins_per_octave=24)
    chroma_vals = np.sum(chroma, axis=1)

    pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    maj_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
    min_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

    key_corrs = {pitches[i] + " major": np.corrcoef(maj_profile, np.roll(chroma_vals, i))[0, 1] for i in range(12)}
    key_corrs.update({pitches[i] + " minor": np.corrcoef(min_profile, np.roll(chroma_vals, i))[0, 1] for i in range(12)})
    best_key = max(key_corrs, key=key_corrs.get)

    return jsonify({"key": best_key, "correlation": key_corrs[best_key]}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # ✅ Allow external access if needed
