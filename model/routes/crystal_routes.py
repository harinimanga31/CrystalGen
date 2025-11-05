from flask import Blueprint, request, jsonify
from datetime import datetime
import jwt
from pymongo import MongoClient, errors
import os
import json
from bson import json_util, ObjectId

# MongoDB connection configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://crystaladmin:crystalgen@cluster0.izeivgm.mongodb.net/?retryWrites=true&w=majority")
DB_NAME = "crystalgen_db"
COLLECTION_NAME = "models"

# Create MongoDB client with retry configuration
client = MongoClient(MONGO_URI, 
                    retryWrites=True, 
                    connectTimeoutMS=5000,
                    serverSelectionTimeoutMS=5000)

try:
    # Test the connection
    client.admin.command('ping')
    db = client[DB_NAME]
    models = db[COLLECTION_NAME]
    
    # Ensure indexes exist
    models.create_index([("username", 1)])
    models.create_index([("timestamp", -1)])
    print("✅ Successfully connected to MongoDB and initialized indexes")
    
except Exception as e:
    print("❌ Error connecting to MongoDB:", str(e))
    raise Exception("Failed to connect to MongoDB. Please check your connection string and ensure MongoDB is running.")

crystal_bp = Blueprint('crystal', __name__)
SECRET_KEY = "crystal_secret"

# Dummy placeholder generation logic (replace with your CVAE model)
# def generate_crystal_structure(formula, spacegroup, composition, num_atoms, temperature):
#     print(f"\nGenerating structure for {formula} with {num_atoms} atoms at T={temperature}")
    
#     # Calculate basic parameters based on composition and num_atoms
#     base_length = max(5.0 + (num_atoms * 0.2), 8.0)  # Increased scaling and minimum size
    
#     # Calculate volume based on the unit cell parameters
#     volume = base_length ** 3  # Cubic approximation for demo
    
#     lattice_params = {
#         "a": float(base_length),
#         "b": float(base_length),
#         "c": float(base_length),
#         "alpha": float(90.0),
#         "beta": float(90.0),
#         "gamma": float(90.0),
#         "volume": float(volume)
#     }
    
#     print(f"Lattice parameters: a=b=c={base_length:.3f}, volume={volume:.3f}")
    
#     # Generate atom positions based on composition
#     atoms = []
#     total_atoms = sum(int(amt) for amt in composition.values())
#     print(f"Generating positions for {total_atoms} atoms")
    
#     # Improved grid system with better spacing
#     grid_size = int(pow(total_atoms, 1/3)) + 2  # Increased grid size
#     spacing = 0.8 / grid_size  # Reduced spacing to keep atoms within bounds
#     offset = 0.1  # Offset from edges
    
#     atom_count = 0
#     for idx, (el, amount) in enumerate(composition.items()):
#         amount = int(amount)
#         print(f"\nProcessing element {el} with amount {amount}")
        
#         for i in range(amount):
#             # Calculate grid position with improved distribution
#             grid_x = (atom_count % grid_size)
#             grid_y = ((atom_count // grid_size) % grid_size)
#             grid_z = (atom_count // (grid_size * grid_size)) % grid_size
            
#             # Calculate base positions with offset to avoid edges
#             base_x = offset + (grid_x * spacing)
#             base_y = offset + (grid_y * spacing)
#             base_z = offset + (grid_z * spacing)
            
#             # Add controlled randomization
#             rand_x = (temperature * 0.1 * (idx + 1)) % 0.1
#             rand_y = (temperature * 0.1 * (i + 1)) % 0.1
#             rand_z = (temperature * 0.1) % 0.1
            
#             # Calculate final fractional coordinates
#             frac_x = min(max(base_x + rand_x, 0.05), 0.95)
#             frac_y = min(max(base_y + rand_y, 0.05), 0.95)
#             frac_z = min(max(base_z + rand_z, 0.05), 0.95)
            
#             # Convert to cartesian coordinates
#             cart_x = frac_x * base_length
#             cart_y = frac_y * base_length
#             cart_z = frac_z * base_length
            
#             print(f"Atom {el} {i+1}:")
#             print(f"  Grid:       ({grid_x}, {grid_y}, {grid_z})")
#             print(f"  Fractional: ({frac_x:.3f}, {frac_y:.3f}, {frac_z:.3f})")
#             print(f"  Cartesian:  ({cart_x:.3f}, {cart_y:.3f}, {cart_z:.3f}) Å")
            
#             atoms.append({
#                 "element": el,
#                 "position": [float(cart_x), float(cart_y), float(cart_z)],
#                 "frac_coords": [float(frac_x), float(frac_y), float(frac_z)]
#             })
            
#             atom_count += 1
    
#     # Generate XYZ data
#     xyz_lines = [f"{len(atoms)}\n{formula}"]
#     for atom in atoms:
#         pos = atom["position"]
#         xyz_lines.append(f"{atom['element']} {pos[0]:.3f} {pos[1]:.3f} {pos[2]:.3f}")
#     xyz_data = "\n".join(xyz_lines)
    
#     # Generate basic CIF data
#     cif_data = f"""data_{formula}
# _cell_length_a {lattice_params['a']:.3f}
# _cell_length_b {lattice_params['b']:.3f}
# _cell_length_c {lattice_params['c']:.3f}
# _cell_angle_alpha {lattice_params['alpha']:.1f}
# _cell_angle_beta {lattice_params['beta']:.1f}
# _cell_angle_gamma {lattice_params['gamma']:.1f}
# _symmetry_space_group_name_H-M "{spacegroup}"
# """

#     return {
#         "formula": formula,
#         "spacegroup": int(spacegroup),
#         "lattice_parameters": lattice_params,
#         "atoms": atoms,
#         "xyz_data": xyz_data,
#         "cif_data": cif_data
#     }

def generate_crystal_structure(formula, spacegroup, composition, num_atoms, temperature):
    print(f"\nGenerating structure for {formula} with {num_atoms} atoms at T={temperature}")
    
    # Calculate basic parameters based on composition and num_atoms
    base_length = max(5.0 + (num_atoms * 0.2), 8.0)
    volume = base_length ** 3
    
    lattice_params = {
        "a": float(base_length),
        "b": float(base_length),
        "c": float(base_length),
        "alpha": 90.0,
        "beta": 90.0,
        "gamma": 90.0,
        "volume": float(volume)
    }
    
    print(f"Lattice parameters: a=b=c={base_length:.3f}, volume={volume:.3f}")
    
    # Generate atom positions based on composition
    atoms = []
    total_atoms = sum(int(amt) for amt in composition.values())
    print(f"Generating positions for {total_atoms} atoms")
    
    # Improved grid system with better spacing
    grid_size = int(pow(total_atoms, 1/3)) + 2
    spacing = 0.8 / grid_size
    offset = 0.1
    
    atom_count = 0
    for idx, (el, amount) in enumerate(composition.items()):
        amount = int(amount)
        print(f"\nProcessing element {el} with amount {amount}")
        
        for i in range(amount):
            # Calculate grid position
            grid_x = (atom_count % grid_size)
            grid_y = ((atom_count // grid_size) % grid_size)
            grid_z = (atom_count // (grid_size * grid_size)) % grid_size
            
            # Calculate base positions with offset
            base_x = offset + (grid_x * spacing)
            base_y = offset + (grid_y * spacing)
            base_z = offset + (grid_z * spacing)
            
            # Add controlled randomization
            import random
            random.seed(atom_count + int(temperature * 100))
            rand_x = random.uniform(0, temperature * 0.05)
            rand_y = random.uniform(0, temperature * 0.05)
            rand_z = random.uniform(0, temperature * 0.05)
            
            # Calculate final fractional coordinates
            frac_x = min(max(base_x + rand_x, 0.05), 0.95)
            frac_y = min(max(base_y + rand_y, 0.05), 0.95)
            frac_z = min(max(base_z + rand_z, 0.05), 0.95)
            
            # Convert to cartesian coordinates - CRITICAL: Ensure proper float conversion
            cart_x = float(frac_x * base_length)
            cart_y = float(frac_y * base_length)
            cart_z = float(frac_z * base_length)
            
            print(f"Atom {el} {i+1}:")
            print(f"  Fractional: ({frac_x:.3f}, {frac_y:.3f}, {frac_z:.3f})")
            print(f"  Cartesian:  ({cart_x:.3f}, {cart_y:.3f}, {cart_z:.3f}) Å")
            
            # CRITICAL FIX: Explicitly create lists with float values
            atom_data = {
                "element": str(el),
                "position": [float(cart_x), float(cart_y), float(cart_z)],
                "frac_coords": [float(frac_x), float(frac_y), float(frac_z)]
            }
            
            atoms.append(atom_data)
            atom_count += 1
    
    # Verify atoms have valid positions
    for i, atom in enumerate(atoms):
        pos = atom["position"]
        if not all(isinstance(p, (int, float)) and not (isinstance(p, bool)) for p in pos):
            print(f"WARNING: Atom {i} has invalid position types: {[type(p) for p in pos]}")
        if all(p == 0 for p in pos):
            print(f"WARNING: Atom {i} has all zero positions!")
    
    # Generate XYZ data
    xyz_lines = [f"{len(atoms)}\n{formula}"]
    for atom in atoms:
        pos = atom["position"]
        xyz_lines.append(f"{atom['element']} {pos[0]:.6f} {pos[1]:.6f} {pos[2]:.6f}")
    xyz_data = "\n".join(xyz_lines)
    
    # Generate CIF data
    cif_data = f"""data_{formula}
_cell_length_a {lattice_params['a']:.6f}
_cell_length_b {lattice_params['b']:.6f}
_cell_length_c {lattice_params['c']:.6f}
_cell_angle_alpha {lattice_params['alpha']:.2f}
_cell_angle_beta {lattice_params['beta']:.2f}
_cell_angle_gamma {lattice_params['gamma']:.2f}
_symmetry_space_group_name_H-M "{spacegroup}"
loop_
_atom_site_label
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
"""
    
    for i, atom in enumerate(atoms):
        frac = atom["frac_coords"]
        cif_data += f"{atom['element']}{i+1} {frac[0]:.6f} {frac[1]:.6f} {frac[2]:.6f}\n"

    result = {
        "formula": formula,
        "spacegroup": int(spacegroup),
        "lattice_parameters": lattice_params,
        "atoms": atoms,
        "xyz_data": xyz_data,
        "cif_data": cif_data
    }
    
    print(f"\n✅ Generated {len(atoms)} atoms with valid positions")
    return result
def verify_document(doc_id):
    """Verify a document exists in MongoDB and has required fields"""
    doc = models.find_one({"_id": doc_id})
    if not doc:
        raise Exception("Document not found after save")
    
    required_fields = ['username', 'formula', 'spacegroup', 'composition', 'timestamp']
    missing = [field for field in required_fields if field not in doc]
    if missing:
        models.delete_one({"_id": doc_id})  # Rollback invalid document
        raise Exception(f"Saved document missing required fields: {missing}")
    
    return doc





@crystal_bp.route('/history/<username>', methods=['GET'])
@crystal_bp.route('/api/elements', methods=['GET'])
def get_elements():
    elements = [
        'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
        'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
        'Ti', 'Fe'
    ]
    return jsonify({"success": True, "elements": elements})

@crystal_bp.route('/api/generate', methods=['POST'])
def generate_model():
    print("\n=== Generate Request Started ===")
    try:
        # 1. Validate Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ Invalid or missing Authorization header")
            return jsonify({"error": "Invalid or missing Authorization header"}), 401
        
        try:
            # Extract and decode token
            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            username = decoded.get("username")
            user_id = str(decoded.get("id"))

            if not username or not user_id:
                print("❌ Missing user information in token")
                print("Token payload:", decoded)
                return jsonify({"error": "Invalid token: missing user information"}), 401

            print(f"✅ Authenticated user: {username} (ID: {user_id})")
            
        except Exception as e:
            print("JWT decode error:", e)
            return jsonify({"error": "Invalid token"}), 401

        # 2. Validate request data
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.json
        print("Received request data:", json.dumps(data, indent=2))

        # 3. Extract and validate parameters
        composition = data.get('composition', {})
        if not composition:
            return jsonify({"error": "Composition is required"}), 400

        spacegroup = int(data.get('spacegroup', 225))
        num_atoms = int(data.get('num_atoms', 8))
        temperature = float(data.get('temperature', 1.0))

        # 4. Generate crystal structure
        formula = "".join([f"{el}{amt}" for el, amt in composition.items()])
        print(f"\nGenerating structure for formula: {formula}")
        print(f"Parameters: spacegroup={spacegroup}, num_atoms={num_atoms}, temperature={temperature}")
        print(f"Composition: {composition}")

        try:
            result = generate_crystal_structure(
                formula=formula,
                spacegroup=spacegroup,
                composition=composition,
                num_atoms=num_atoms,
                temperature=temperature
            )
            
            # Verify the generated structure
            if not result.get('atoms'):
                raise ValueError("No atoms generated in structure")
            
            # Verify atom positions
            for i, atom in enumerate(result['atoms']):
                pos = atom['position']
                if all(p == 0 for p in pos):
                    print(f"WARNING: Atom {i} ({atom['element']}) has zero position")
            
            print(f"✅ Successfully generated structure with {len(result['atoms'])} atoms")
            
        except Exception as e:
            print(f"❌ Error generating structure: {str(e)}")
            return jsonify({"error": f"Failed to generate structure: {str(e)}"}), 500

        # 5. Save to database
        document = {
            "user_id": user_id,
            "username": username,
            "formula": formula,
            "spacegroup": spacegroup,
            "composition": composition,
            "num_atoms": num_atoms,
            "temperature": temperature,
            "result": result,
            "timestamp": datetime.utcnow()
        }

        try:
            inserted_id = save_to_mongodb(username, document)
            saved_doc = verify_document(inserted_id)
            print(f"✅ Saved structure to database with ID: {inserted_id}")
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
            return jsonify({"error": f"Failed to save structure: {str(e)}"}), 500

        # 6. Return successful response
        response_data = {
            "success": True,
            "message": "Structure generated successfully",
            "model_id": str(inserted_id),
            **result
        }
        
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_history(username):
    print(f"\n=== FETCHING HISTORY FOR {username} ===")
    try:
        # 1. Validate Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ Invalid or missing Authorization header")
            return jsonify({"error": "Invalid or missing Authorization header"}), 401
        
        try:
            # Extract and decode token
            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            token_username = decoded.get("username")
            user_id = decoded.get("id")

            # Verify token matches requested username
            if not token_username or not user_id or token_username != username:
                print("❌ Token username doesn't match requested username")
                return jsonify({"error": "Unauthorized access"}), 403

            print(f"✅ Authenticated user: {username} (ID: {user_id})")
            
        except Exception as e:
            print("JWT decode error:", e)
            return jsonify({"error": "Invalid token"}), 401

        # 2. Check MongoDB connection
        try:
            db.command("ping")
            print("MongoDB connection verified")
        except Exception as conn_err:
            print("MongoDB connection error:", str(conn_err))
            return jsonify({"error": "Database connection error"}), 500

        # 3. Check collection exists and count all documents
        total_docs = models.count_documents({})
        print(f"Total documents in collection: {total_docs}")

        # 4. Search for user's documents using user_id
        user_docs = models.count_documents({"user_id": user_id})
        print(f"Documents for user {username} (ID: {user_id}): {user_docs}")

        # 5. Fetch user's models using user_id
        user_models = list(models.find(
            {"user_id": user_id},
            {"_id": 1, "formula": 1, "result": 1, "timestamp": 1}
        ))
        
        # 5. Convert for JSON response
        formatted_models = []
        for model in user_models:
            model['_id'] = str(model['_id'])
            formatted_models.append(model)

        print(f"Successfully retrieved {len(formatted_models)} models")
        
        return jsonify({
            "success": True,
            "history": formatted_models,
            "total_count": total_docs,
            "user_count": user_docs
        })

    except Exception as e:
        print("Error in get_history:", str(e))
        return jsonify({"error": f"Failed to fetch history: {str(e)}"}), 500
