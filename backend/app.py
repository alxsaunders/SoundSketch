from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class Tonal_Fragment:
    def __init__(self, waveform, sr, tstart=None, tend=None):
        self.waveform = waveform
        self.sr = sr
        self.tstart = tstart
        self.tend = tend
        
        if self.tstart is not None:
            self.tstart = librosa.time_to_samples(self.tstart, sr=self.sr)
        if self.tend is not None:
            self.tend = librosa.time_to_samples(self.tend, sr=self.sr)
            
        self.y_segment = self.waveform[self.tstart:self.tend]
        self.chromograph = librosa.feature.chroma_cqt(y=self.y_segment, sr=self.sr, bins_per_octave=24)
        
        # chroma_vals is the amount of each pitch class present in this time interval
        self.chroma_vals = []
        for i in range(12):
            self.chroma_vals.append(float(np.sum(self.chromograph[i])))
            
        self.pitches = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
        # dictionary relating pitch names to the associated intensity in the song
        self.keyfreqs = {self.pitches[i]: self.chroma_vals[i] for i in range(12)} 
        
        self.keys = [self.pitches[i] + ' major' for i in range(12)] + [self.pitches[i] + ' minor' for i in range(12)]

        # Krumhansl-Schmuckler key profiles
        self.maj_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
        self.min_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

        # Calculate correlations
        self.min_key_corrs = []
        self.maj_key_corrs = []
        
        for i in range(12):
            key_test = [self.keyfreqs.get(self.pitches[(i + m)%12]) for m in range(12)]
            self.maj_key_corrs.append(round(float(np.corrcoef(self.maj_profile, key_test)[1,0]), 3))
            self.min_key_corrs.append(round(float(np.corrcoef(self.min_profile, key_test)[1,0]), 3))

        # Create dictionary of keys and their correlations
        self.key_dict = {
            **{self.keys[i]: self.maj_key_corrs[i] for i in range(12)}, 
            **{self.keys[i+12]: self.min_key_corrs[i] for i in range(12)}
        }
        
        # Find best key and correlation
        self.key = max(self.key_dict, key=self.key_dict.get)
        self.bestcorr = max(self.key_dict.values())
        
        # Find alternative key if it exists
        self.altkey = None
        self.altbestcorr = None
        
        for key, corr in self.key_dict.items():
            if corr > self.bestcorr*0.9 and corr != self.bestcorr:
                self.altkey = key
                self.altbestcorr = corr
                break
    
    def get_analysis_results(self):
        # Normalize chroma values for display
        chroma_max = max(self.chroma_vals)
        normalized_chroma = [val/chroma_max for val in self.chroma_vals]
        
        return {
            "mainKey": {
                "key": self.key,
                "correlation": self.bestcorr
            },
            "alternateKey": {
                "key": self.altkey,
                "correlation": self.altbestcorr
            } if self.altkey else None,
            "chromaValues": [
                {"pitch": pitch, "intensity": float(intensity)}
                for pitch, intensity in zip(self.pitches, normalized_chroma)
            ],
            "correlations": [
                {"key": key, "correlation": float(corr)}
                for key, corr in self.key_dict.items()
            ]
        }

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['audio']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(filepath)
        waveform, sr = librosa.load(filepath, sr=None)
        
        # Create Tonal_Fragment instance and analyze
        analyzer = Tonal_Fragment(waveform, sr)
        results = analyzer.get_analysis_results()
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    finally:
        # Clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(debug=True, port=5000)