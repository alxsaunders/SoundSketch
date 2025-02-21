from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import os
import uuid
import gc
import traceback

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class Tonal_Fragment:
    def __init__(self, waveform, sr, tstart=None, tend=None):
        self.waveform = waveform
        self.sr = sr

        # Convert start and end time to samples
        self.tstart = librosa.time_to_samples(tstart, sr=self.sr) if tstart is not None else 0
        self.tend = librosa.time_to_samples(tend, sr=self.sr) if tend is not None else len(self.waveform)

        # Ensure valid range
        self.tstart = max(0, min(self.tstart, len(self.waveform)))
        self.tend = max(0, min(self.tend, len(self.waveform)))

        self.y_segment = self.waveform[self.tstart:self.tend]

        if len(self.y_segment) == 0:
            raise ValueError("Invalid audio segment (empty).")

        try:
            # Initialize with default values in case of failure
            self.pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            
            # Try using simpler chroma feature extraction first
            print("Computing chroma features...")
            try:
                # Safer approach: use chroma_stft instead of chroma_cqt with hpss
                self.chromograph = librosa.feature.chroma_stft(
                    y=self.y_segment, 
                    sr=self.sr
                )
                print(f"Chromograph shape: {self.chromograph.shape}")
            except Exception as e:
                print(f"Error in chroma extraction: {str(e)}")
                # Fallback to a safe default
                self.chromograph = np.zeros((12, max(1, len(self.y_segment) // 512)))
            
            # Ensure chromograph has exactly 12 rows
            if self.chromograph.shape[0] != 12:
                print(f"Warning: chromograph shape is {self.chromograph.shape}, expected 12 rows")
                # Create a safe version with exactly 12 rows
                safe_chromograph = np.zeros((12, self.chromograph.shape[1]))
                for i in range(min(12, self.chromograph.shape[0])):
                    safe_chromograph[i] = self.chromograph[i]
                self.chromograph = safe_chromograph
            
            # Safely sum chroma values
            self.chroma_vals = []
            for i in range(12):
                if i < self.chromograph.shape[0]:
                    self.chroma_vals.append(float(np.sum(self.chromograph[i])))
                else:
                    self.chroma_vals.append(0.0)
            
            print(f"Chroma values computed: {len(self.chroma_vals)} values")
            
            # Create key-value mapping
            self.keyfreqs = {self.pitches[i]: self.chroma_vals[i] for i in range(12)}

            # Define all possible keys
            self.keys = [p + ' major' for p in self.pitches] + [p + ' minor' for p in self.pitches]

            # Krumhansl-Schmuckler key profiles
            self.maj_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
            self.min_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
            
            # Compute key correlations
            self.min_key_corrs = []
            self.maj_key_corrs = []
            
            # Normalize chroma values for better correlation
            chroma_sum = sum(self.chroma_vals)
            if chroma_sum > 0:
                normalized_chroma = [val/chroma_sum for val in self.chroma_vals]
            else:
                normalized_chroma = [1.0/12] * 12  # Equal distribution if all zeros
            
            print("Computing key correlations...")
            # Calculate correlation for each possible key
            for i in range(12):
                # For each possible key, rotate the pitch distribution to align with profile
                key_test = [normalized_chroma[(i + m) % 12] for m in range(12)]
                
                # Correlation with major profile
                maj_corr = np.corrcoef(self.maj_profile, key_test)[1, 0] if np.std(key_test) > 0 else 0
                
                # Correlation with minor profile
                min_corr = np.corrcoef(self.min_profile, key_test)[1, 0] if np.std(key_test) > 0 else 0
                
                self.maj_key_corrs.append(round(float(maj_corr), 3))
                self.min_key_corrs.append(round(float(min_corr), 3))

            # Build key correlation dictionary
            self.key_dict = {}
            for i in range(12):
                self.key_dict[self.keys[i]] = self.maj_key_corrs[i]
            
            for i in range(12):
                self.key_dict[self.keys[i+12]] = self.min_key_corrs[i]
            
            # Safety check: make sure we have correlations
            if not self.key_dict:
                print("Warning: No key correlations computed")
                self.key_dict = {k: 0 for k in self.keys}

            # Identify best key
            self.key = max(self.key_dict, key=self.key_dict.get)
            self.bestcorr = self.key_dict[self.key]
            print(f"Best key identified: {self.key} with correlation {self.bestcorr}")

            # Find alternate key with highest correlation that isn't the best
            self.altkey, self.altbestcorr = None, None
            sorted_keys = sorted(self.key_dict.items(), key=lambda x: x[1], reverse=True)
            if len(sorted_keys) > 1:  # Make sure there's at least a second-best
                second_best = sorted_keys[1]
                if second_best[1] > self.bestcorr * 0.9:  # Only if it's close enough
                    self.altkey, self.altbestcorr = second_best
                    print(f"Alternate key: {self.altkey} with correlation {self.altbestcorr}")
        
        except Exception as e:
            print(f"Error in key detection: {str(e)}")
            print(traceback.format_exc())
            # Set default values in case of error
            self.chromograph = np.zeros((12, 1))
            self.chroma_vals = [0] * 12
            self.pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            self.keyfreqs = {p: 0 for p in self.pitches}
            self.keys = [p + ' major' for p in self.pitches] + [p + ' minor' for p in self.pitches]
            self.key = "C major"  # Default key
            self.bestcorr = 0
            self.altkey = None
            self.altbestcorr = None
            self.key_dict = {k: 0 for k in self.keys}
            self.maj_key_corrs = [0] * 12
            self.min_key_corrs = [0] * 12
            raise

    def get_analysis_results(self):
        try:
            # Normalize chroma values for display
            chroma_max = max(self.chroma_vals) if max(self.chroma_vals) > 0 else 1
            normalized_chroma = [val / chroma_max for val in self.chroma_vals]

            # Ensure we have sorted correlations, even if empty
            try:
                sorted_correlations = sorted(
                    [(key, corr) for key, corr in self.key_dict.items()],
                    key=lambda x: x[1],
                    reverse=True
                )
            except Exception as e:
                print(f"Error sorting correlations: {str(e)}")
                sorted_correlations = []

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
                    for key, corr in sorted_correlations
                ]
            }
        except Exception as e:
            print(f"Error in get_analysis_results: {str(e)}")
            print(traceback.format_exc())
            # Return minimal results with error info
            return {
                "mainKey": {
                    "key": "Error",
                    "correlation": 0
                },
                "error": str(e),
                "chromaValues": [
                    {"pitch": p, "intensity": 0}
                    for p in self.pitches
                ],
                "correlations": []
            }

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['audio']
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400
        
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

    try:
        file.save(filepath)
        print(f"File saved: {filepath}")
        
        # Load audio with error checking
        try:
            waveform, sr = librosa.load(filepath, sr=None)
            print(f"Audio loaded: {len(waveform)} samples, {sr}Hz")
            
            if len(waveform) == 0:
                raise ValueError("Uploaded file contains no audio data.")
                
            if sr == 0:
                raise ValueError("Invalid sample rate.")
        except Exception as e:
            print(f"Audio loading error: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"error": f"Failed to load audio: {str(e)}"}), 400
            
        # Check for silence
        audio_energy = np.mean(np.abs(waveform))
        print(f"Audio energy: {audio_energy}")
        if audio_energy < 0.001:
            return jsonify({"error": "Audio file contains mostly silence"}), 400

        # For very long files, analyze first 30 seconds only
        if len(waveform) > sr * 30:
            print(f"File too long, analyzing first 30 seconds only")
            waveform = waveform[:sr * 30]
            
        # Analyze the audio
        print("Starting key analysis...")
        analyzer = Tonal_Fragment(waveform, sr)
        results = analyzer.get_analysis_results()
        print(f"Key analysis complete: {results['mainKey']['key']}")
        
        # Add file metadata
        results["fileInfo"] = {
            "filename": file.filename,
            "duration": len(waveform) / sr,
            "sampleRate": sr
        }

        # Optional: Estimate BPM
        try:
            print("Estimating tempo...")
            tempo, _ = librosa.beat.beat_track(y=waveform, sr=sr)
            results["tempo"] = round(float(tempo), 1)
            print(f"Tempo: {results['tempo']} BPM")
        except Exception as e:
            print(f"Tempo estimation error: {str(e)}")
            # Skip tempo detection if it fails
            pass
            
        return jsonify(results)

    except ValueError as ve:
        print(f"Value error: {str(ve)}")
        print(traceback.format_exc())
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        print(f"Internal error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

    finally:
        # Clean up the temporary file
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"Temp file removed: {filepath}")
        except Exception as e:
            print(f"Error removing temp file: {str(e)}")
                
        # Force garbage collection to free memory
        gc.collect()

if __name__ == '__main__':
    app.run(debug=True, port=5000)