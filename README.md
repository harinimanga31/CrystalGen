🧊 CrystalGen: AI-Powered Crystal Structure Generator 

CrystalGen is an AI-powered web application built with Flask that generates and visualizes crystal structures using a Conditional Variational Autoencoder (CVAE).
It allows users to configure parameters such as space group, composition, and temperature, and instantly generate realistic 3D crystal lattices.

🌐 Overview

CrystalGen integrates:

🧠 Deep Learning (CVAE) for structure generation

🔬 Pymatgen for CIF parsing and structure validation

🧱 Torch Geometric (PyG) for crystal graph representation

🌍 Flask Backend + HTML/JS Frontend for seamless web experience

🎨 3D visualization (Three.js / Plotly / Py3Dmol) for viewing atomic structures



project structure 


<img width="266" height="717" alt="image" src="https://github.com/user-attachments/assets/c61a8c5f-e502-4925-bd18-b0011ce574d3" />




⚙️ Installation Guide
1️⃣ Clone the Repository
git clone https://github.com/harinimanga31/CrystalGen
cd CrystalGen

2️⃣ Create and Activate Virtual Environment
python -m venv venv
venv\Scripts\activate      # Windows
# or
source venv/bin/activate   # Mac/Linux

3️⃣ Install Dependencies
pip install -r requirements.txt

4️⃣ Run the Flask Application
python app.py


Once running, open your browser at:
👉 http://127.0.0.1:5000

🧠 Model Description

CrystalGen uses a Conditional Variational Autoencoder (CVAE) to generate valid crystal structures.

Architecture:

Encoder: Compresses crystal data into latent vector

Latent Diffusion: Adds variation and ensures diversity in generated structures

Decoder: Reconstructs valid 3D crystal lattices

Output: CIF structure + 3D visualized model

Training Results:
Model	Parameters	Loss	Accuracy	Quality
Old Model	2.47M	54.8	72%	Moderate
New Model	18.07M	12.3	91%	Excellent

✅ Faster convergence
✅ Better reconstruction
✅ Improved stability

💻 Web Interface
🔹 Home Page

Configure parameters like:

Space Group (1–230)

Chemical Composition (e.g., FeO, SiO₂, TiO₂)

Number of Atoms

Temperature

Then click “Generate Structure” to create a new crystal.

🔹 Generated Structure Page

Displays 3D structure visualization (rotatable model)

Shows CIF file preview

Allows structure download

🔹 Metrics Page

Displays training/testing losses

Shows performance graphs and accuracy comparisons

🧪 API Endpoints (Flask)
Route	Method	Description
/	GET	Main web interface
/generate	POST	Generate a new crystal structure
/results	GET	Display generated structure
/metrics	GET	Show training and testing metrics
🔍 Example API Usage
import requests

url = "http://127.0.0.1:5000/generate"
payload = {
    "space_group": 225,
    "composition": "FeO",
    "atoms": 8,
    "temperature": 1.0
}

response = requests.post(url, json=payload)
print(response.json())

📈 Model Training Workflow

1️⃣ Load and preprocess CIF data using pymatgen
2️⃣ Convert to graph structures (torch_geometric)
3️⃣ Train CVAE model with reconstruction + KL divergence loss
4️⃣ Evaluate reconstruction accuracy and latent space quality
5️⃣ Save best model in /models/best_model_classification.pt

🎥 Presentation Flow (for demo/video)
Step	Description	Duration
1️⃣	Explain VS Code folder structure & formatting	20 sec
2️⃣	Show Flask app (app.py) and routes	20 sec
3️⃣	Run frontend + backend	20 sec
4️⃣	Demonstrate 3D crystal visualization	20 sec
5️⃣	Display training/testing metrics	20 sec
6️⃣	Conclude with model performance	10 sec
📊 Example Metrics
Metric	Old Model	New Model
Reconstruction Loss	0.125	0.034
KL Divergence	0.015	0.006
Generation Accuracy	72%	91%
Inference Time	0.42s	0.18s
🧾 Dependencies

Python ≥ 3.12

Flask

PyTorch

Torch Geometric

Pymatgen

NumPy, SciPy, Matplotlib

Plotly or Py3Dmol (for 3D visualization)

Install them via:

pip install flask torch pymatgen torch-geometric plotly numpy

🧩 Visualization Flow
CIF Input → Parser (Pymatgen) → Graph Builder (PyG)
→ CVAE Encoder → Latent Diffusion → Decoder
→ Structure Generation → 3D Visualization → Web UI

💡 Future Enhancements

🌐 Deploy Flask app on Render / AWS / Heroku

📦 Add database for storing generated structures

🧮 Integrate GNN-based property prediction

🧭 Support real-time model retraining from UI

👩‍💻 Contributors

Developer: Harini Manga
Backend (Flask + PyTorch): Model & API integration
Frontend (HTML/CSS/JS): Web interface & visualization
Visualization: 3D atomic structure rendering
