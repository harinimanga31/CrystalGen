import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Download, 
  Loader2, 
  Info, 
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Sliders,
  Eye,
  FileText
} from 'lucide-react';

// Type definitions
interface LatticeParameters {
  a: number;
  b: number;
  c: number;
  alpha: number;
  beta: number;
  gamma: number;
  volume: number;
}

interface AtomData {
  element: string;
  position: number[];
  frac_coords: number[];
}

interface StructureResponse {
  success: boolean;
  formula?: string;
  spacegroup: number;
  lattice_parameters?: LatticeParameters;
  atoms?: AtomData[];
  xyz_data?: string;
  cif_data?: string;
  error?: string;
}

interface CompositionEntry {
  element: string;
  amount: number;
}

const Generate: React.FC = () => {
  const [spacegroup, setSpacegroup] = useState<number>(225);
  const [composition, setComposition] = useState<CompositionEntry[]>([
    { element: 'Fe', amount: 1 },
    { element: 'O', amount: 1 }
  ]);
  const [numAtoms, setNumAtoms] = useState<number>(8);
  const [temperature, setTemperature] = useState<number>(1.0);
  const [newElement, setNewElement] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StructureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableElements, setAvailableElements] = useState<string[]>([]);
  const [viewerLoaded, setViewerLoaded] = useState<boolean>(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);

  const API_URL = 'http://localhost:5000/api';

  const defaultElements = [
    'H','He','Li','Be','B','C','N','O','F','Ne',
    'Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Ti','Fe'
  ];

  // Load 3Dmol.js library
  useEffect(() => {
    const load3Dmol = () => {
      if ((window as any).$3Dmol) {
        setViewerLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js';
      script.async = false;
      script.onload = () => {
        console.log('3Dmol.js loaded successfully');
        setViewerLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load 3Dmol.js');
        setError('Failed to load 3D visualization library');
      };
      document.head.appendChild(script);
    };

    load3Dmol();
  }, []);

  // Fetch available elements
  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await fetch(`${API_URL}/elements`);
        const data = await response.json();
        setAvailableElements(data.elements || defaultElements);
      } catch (err) {
        console.error('Failed to fetch elements:', err);
        setAvailableElements(defaultElements);
      }
    };

    fetchElements();
  }, []);

  // Initialize 3D viewer when result changes
  useEffect(() => {
    if (result && result.xyz_data && viewerLoaded && viewerRef.current) {
      initializeViewer(result.xyz_data);
    }
  }, [result, viewerLoaded]);

  const initializeViewer = (xyzData: string) => {
    try {
      if (!viewerRef.current || !(window as any).$3Dmol) {
        console.error('Viewer not ready');
        return;
      }

      // Clear previous viewer
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.clear();
      }

      viewerRef.current.innerHTML = '';
      
      const config = {
        backgroundColor: '#f8f9fa',
        antialias: true,
      };
      
      const viewer = (window as any).$3Dmol.createViewer(viewerRef.current, config);
      viewerInstanceRef.current = viewer;
      
      viewer.addModel(xyzData, 'xyz');
      viewer.setStyle({}, {
        sphere: { radius: 0.5, color: 'spectrum' },
        stick: { radius: 0.15, color: 'grey' }
      });
      
      viewer.setBackgroundColor('#f8f9fa');
      viewer.zoomTo();
      viewer.render();
      viewer.zoom(1.3, 1000);
      
      console.log('3D viewer initialized successfully');
    } catch (err) {
      console.error('Error initializing viewer:', err);
      setError('Failed to render 3D structure');
    }
  };

  const handleAddElement = () => {
    if (newElement && availableElements.includes(newElement)) {
      const existingIndex = composition.findIndex(c => c.element === newElement);
      if (existingIndex >= 0) {
        const updated = [...composition];
        updated[existingIndex].amount = newAmount;
        setComposition(updated);
      } else {
        setComposition([...composition, { element: newElement, amount: newAmount }]);
      }
      setNewElement('');
      setNewAmount(1);
    }
  };

  const handleRemoveElement = (index: number) => {
    setComposition(composition.filter((_, i) => i !== index));
  };

  // const handleGenerate = async () => {
  //   if (composition.length === 0) {
  //     setError('Please add at least one element to the composition');
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);
  //   setResult(null);

  //   try {
  //     const compositionDict: Record<string, number> = {};
  //     composition.forEach(c => {
  //       compositionDict[c.element] = c.amount;
  //     });

  //     console.log('Sending request to:', `${API_URL}/generate`);
  //     console.log('Request data:', {
  //       spacegroup,
  //       composition: compositionDict,
  //       num_atoms: numAtoms,
  //       temperature
  //     });

  //     const response = await fetch(`${API_URL}/generate`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         spacegroup: spacegroup,
  //         composition: compositionDict,
  //         num_atoms: numAtoms,
  //         temperature: temperature,
  //       }),
  //     });

  //     const data: StructureResponse = await response.json();
  //     console.log('Response:', data);

  //     if (data.success) {
  //       setResult(data);
  //       setError(null);
  //     } else {
  //       setError(data.error || 'Failed to generate structure');
  //       setResult(null);
  //     }
  //   } catch (err: any) {
  //     setError(`Failed to connect to API: ${err.message}`);
  //     console.error('API Error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleGenerate = async () => {
  if (composition.length === 0) {
    setError('Please add at least one element to the composition');
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    setError("Please login to generate structures");
    return;
  }

  setLoading(true);
  setError(null);
  setResult(null);

  try {
    // Convert composition array to dictionary
    const compositionDict: Record<string, number> = {};
    composition.forEach(c => {
      compositionDict[c.element] = c.amount;
    });

    console.log('Sending generation request:', {
      spacegroup,
      composition: compositionDict,
      num_atoms: numAtoms,
      temperature
    });

    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        token,
        spacegroup,
        composition: compositionDict,
        num_atoms: numAtoms,
        temperature,
      }),
    });

    const data: any = await response.json();
    console.log('Received API response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('Processing successful response...');
      
      // Helper function to convert fractional coordinates to Cartesian
      const fracToCartesian = (frac: number[], latticeMatrix: number[][]): [number, number, number] => {
        const x = latticeMatrix[0][0] * frac[0] + latticeMatrix[1][0] * frac[1] + latticeMatrix[2][0] * frac[2];
        const y = latticeMatrix[0][1] * frac[0] + latticeMatrix[1][1] * frac[1] + latticeMatrix[2][1] * frac[2];
        const z = latticeMatrix[0][2] * frac[0] + latticeMatrix[1][2] * frac[1] + latticeMatrix[2][2] * frac[2];
        return [x, y, z];
      };

      // Extract lattice matrix
      let latticeMatrix: number[][] = [[5.431, 0, 0], [0, 5.431, 0], [0, 0, 5.431]]; // default
      
      if (data.lattice_parameters && data.lattice_parameters.matrix) {
        latticeMatrix = data.lattice_parameters.matrix;
        console.log('Using lattice matrix from response:', latticeMatrix);
      } else if (data.lattice_parameters) {
        // Fallback: create simple cubic lattice from a, b, c parameters
        const { a, b, c } = data.lattice_parameters;
        if (a && b && c) {
          latticeMatrix = [[a, 0, 0], [0, b, 0], [0, 0, c]];
          console.log('Created simple cubic lattice matrix:', latticeMatrix);
        }
      }

      try {
        console.log('Validating lattice parameters...');
        
        // Calculate lattice parameters from matrix if needed
        let params: LatticeParameters;
        
        if (data.lattice_parameters && typeof data.lattice_parameters.a === 'number') {
          // Use provided parameters
          params = {
            a: Number(data.lattice_parameters.a ?? 5.431),
            b: Number(data.lattice_parameters.b ?? 5.431),
            c: Number(data.lattice_parameters.c ?? 5.431),
            alpha: Number(data.lattice_parameters.alpha ?? 90.0),
            beta: Number(data.lattice_parameters.beta ?? 90.0),
            gamma: Number(data.lattice_parameters.gamma ?? 90.0),
            volume: Number(data.lattice_parameters.volume ?? 160.2)
          };
        } else {
          // Calculate from lattice matrix
          const a = Math.sqrt(latticeMatrix[0][0]**2 + latticeMatrix[0][1]**2 + latticeMatrix[0][2]**2);
          const b = Math.sqrt(latticeMatrix[1][0]**2 + latticeMatrix[1][1]**2 + latticeMatrix[1][2]**2);
          const c = Math.sqrt(latticeMatrix[2][0]**2 + latticeMatrix[2][1]**2 + latticeMatrix[2][2]**2);
          
          // Calculate volume using scalar triple product
          const volume = Math.abs(
            latticeMatrix[0][0] * (latticeMatrix[1][1] * latticeMatrix[2][2] - latticeMatrix[1][2] * latticeMatrix[2][1]) -
            latticeMatrix[0][1] * (latticeMatrix[1][0] * latticeMatrix[2][2] - latticeMatrix[1][2] * latticeMatrix[2][0]) +
            latticeMatrix[0][2] * (latticeMatrix[1][0] * latticeMatrix[2][1] - latticeMatrix[1][1] * latticeMatrix[2][0])
          );
          
          params = {
            a: a,
            b: b,
            c: c,
            alpha: 90.0,
            beta: 90.0,
            gamma: 90.0,
            volume: volume
          };
          console.log('Calculated lattice parameters from matrix:', params);
        }

        // Check for NaN values in lattice parameters
        const nanParams = (Object.keys(params) as Array<keyof LatticeParameters>)
          .filter(key => isNaN(params[key]));

        if (nanParams.length > 0) {
          console.error('Found NaN values for lattice parameters:', nanParams);
          setError(`Invalid number values for parameters: ${nanParams.join(', ')}`);
          return;
        }

        console.log('✅ Lattice parameters validated:', params);

        // Validate and convert atoms data
        console.log(`Validating ${data.atoms?.length || 0} atoms...`);
        
        const atoms = data.atoms?.map((atom: any, index: number) => {
          console.log(`Processing atom ${index}:`, JSON.stringify(atom, null, 2));
          
          let position: [number, number, number];
          let frac_coords: [number, number, number];

          // Check if position exists (Cartesian coordinates)
          if (atom.position && Array.isArray(atom.position) && atom.position.length === 3) {
            // Use provided Cartesian coordinates
            position = [
              Number(atom.position[0]) || 0,
              Number(atom.position[1]) || 0,
              Number(atom.position[2]) || 0
            ];
            console.log(`Atom ${index}: Using provided Cartesian position:`, position);
          } else if (atom.frac_coords && Array.isArray(atom.frac_coords) && atom.frac_coords.length === 3) {
            // Calculate Cartesian from fractional coordinates
            const fracArray = [
              Number(atom.frac_coords[0]) || 0,
              Number(atom.frac_coords[1]) || 0,
              Number(atom.frac_coords[2]) || 0
            ];
            position = fracToCartesian(fracArray, latticeMatrix);
            console.log(`Atom ${index}: Calculated Cartesian from frac_coords:`, position);
          } else {
            console.error(`Atom ${index} missing both position and frac_coords:`, atom);
            throw new Error(`Atom ${index} has no valid coordinate data`);
          }

          // Get or validate fractional coordinates
          if (atom.frac_coords && Array.isArray(atom.frac_coords) && atom.frac_coords.length === 3) {
            frac_coords = [
              Number(atom.frac_coords[0]) || 0,
              Number(atom.frac_coords[1]) || 0,
              Number(atom.frac_coords[2]) || 0
            ];
          } else {
            // If no frac_coords provided, we'll just use zeros (shouldn't happen)
            frac_coords = [0, 0, 0];
            console.warn(`Atom ${index}: No fractional coordinates provided, using [0,0,0]`);
          }

          // Check if all positions are zero (likely an error)
          if (position.every(p => p === 0)) {
            console.warn(`⚠️ Atom ${index} (${atom.element}) has all zero positions!`);
          } else {
            console.log(`✅ Atom ${index} (${atom.element}): position = [${position.map(p => p.toFixed(3)).join(', ')}]`);
          }

          // Check for NaN values in positions
          const hasNaN = position.some(p => isNaN(p)) || frac_coords.some(p => isNaN(p));
          if (hasNaN) {
            console.error(`Atom ${index} has NaN values:`, { position, frac_coords });
            throw new Error(`Atom ${index} has invalid numeric values`);
          }

          const validatedAtom = {
            element: String(atom.element || '?'),
            position,
            frac_coords
          };

          return validatedAtom;
        }) ?? [];

        // Final check: ensure we have atoms with non-zero positions
        const nonZeroAtoms = atoms.filter(atom => 
          atom.position.some(p => Math.abs(p) > 0.001) // Use small threshold for floating point
        );

        console.log(`Atom validation summary: ${atoms.length} total, ${nonZeroAtoms.length} with non-zero positions`);

        if (atoms.length > 0 && nonZeroAtoms.length === 0) {
          console.error('❌ All atoms have zero positions!');
          console.error('Raw atoms data:', data.atoms);
          setError('All generated atoms have zero positions. Please try again with different parameters.');
          return;
        }

        // Log sample atom for verification
        if (atoms.length > 0) {
          const firstAtom = atoms[0];
          console.log('First atom details:', {
            element: firstAtom.element,
            position: firstAtom.position,
            position_types: firstAtom.position.map(p => typeof p),
            frac_coords: firstAtom.frac_coords
          });
        }

        console.log(`✅ Successfully validated ${atoms.length} atoms`);

        // Create validated result object
        const validatedResult: StructureResponse = {
          success: true,
          message: data.message || 'Structure generated successfully',
          model_id: data.model_id || data._id,
          formula: data.formula,
          spacegroup: data.spacegroup,
          lattice_parameters: params,
          atoms: atoms,
          xyz_data: data.xyz_data,
          cif_data: data.cif_data
        };

        console.log('Setting validated result...');
        setResult(validatedResult);
        setError(null);
        console.log('✅ Structure generation completed successfully');

      } catch (validationErr) {
        console.error('❌ Error during data validation:', validationErr);
        setError(`Failed to process structure data: ${validationErr instanceof Error ? validationErr.message : 'Unknown error'}`);
        return;
      }

    } else {
      // API returned an error
      console.error('API returned error response:', data.error);
      setError(data.error || 'Failed to generate structure');
      setResult(null);
    }

  } catch (err: any) {
    console.error('❌ API request failed:', err);
    setError(`Failed to connect to API: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const handleDownloadCIF = () => {
    if (result && result.cif_data) {
      const blob = new Blob([result.cif_data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.formula}_sg${result.spacegroup}.cif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const presetCompositions = [
    { label: 'FeO', elements: [{ element: 'Fe', amount: 1 }, { element: 'O', amount: 1 }] },
    { label: 'TiO₂', elements: [{ element: 'Ti', amount: 1 }, { element: 'O', amount: 2 }] },
    { label: 'NaCl', elements: [{ element: 'Na', amount: 1 }, { element: 'Cl', amount: 1 }] },
    { label: 'SiO₂', elements: [{ element: 'Si', amount: 1 }, { element: 'O', amount: 2 }] },
  ];

  const applyPreset = (preset: typeof presetCompositions[0]) => {
    setComposition(preset.elements);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlaskConical className="w-10 h-10 md:w-12 md:h-12 text-indigo-600" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Crystal Structure Generator
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Generate crystal structures using AI-powered CVAE model with 3D visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
                <Sliders className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
                Configuration
              </h2>

              <div className="space-y-6">
                {/* Space Group */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Space Group (1-230)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="230"
                    value={spacegroup}
                    onChange={(e) => setSpacegroup(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Common: 225 (Fm-3m), 194 (P6₃/mmc), 221 (Pm-3m)
                  </p>
                </div>

                {/* Composition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chemical Composition
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {presetCompositions.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <select
                      value={newElement}
                      onChange={(e) => setNewElement(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select element</option>
                      {availableElements.map((el) => (
                        <option key={el} value={el}>{el}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={newAmount}
                      onChange={(e) => setNewAmount(parseFloat(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddElement}
                      disabled={!newElement}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {composition.map((comp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full"
                      >
                        <span className="font-bold text-indigo-900">{comp.element}</span>
                        <span className="text-sm text-indigo-700">{comp.amount}</span>
                        <button
                          onClick={() => handleRemoveElement(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Number of Atoms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Atoms: <span className="text-indigo-600">{numAtoms}</span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={numAtoms}
                    onChange={(e) => setNumAtoms(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>4</span>
                    <span>32</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature: <span className="text-indigo-600">{temperature.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>2.0</span>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || composition.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Atom className="w-6 h-6" />
                      Generate Structure
                    </>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div>
            {result ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
                    Generated
                  </h2>
                  <button
                    onClick={handleDownloadCIF}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    CIF
                  </button>
                </div>

                {/* 3D Viewer */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    3D Visualization
                  </h3>
                  <div
                    ref={viewerRef}
                    className="w-full h-80 md:h-96 border-4 border-gray-200 rounded-2xl bg-gray-50"
                    style={{ position: 'relative' }}
                  >
                    {!viewerLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Structure Info */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Formula</p>
                        <p className="text-lg font-bold text-indigo-900">{result.formula}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Space Group</p>
                        <p className="text-lg font-bold text-indigo-900">{result.spacegroup}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Atoms</p>
                        <p className="text-lg font-bold text-indigo-900">{result.atoms?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Volume</p>
                        <p className="text-lg font-bold text-indigo-900">
                          {result.lattice_parameters?.volume.toFixed(2)} Ų
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lattice Parameters */}
                  {result.lattice_parameters && (
                    <div className="border-2 border-gray-200 rounded-xl p-5">
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600" />
                        Lattice
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {['a', 'b', 'c'].map((param) => (
                          <div key={param} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">{param}</p>
                            <p className="text-base font-bold">
                              {result.lattice_parameters![param as keyof typeof result.lattice_parameters].toFixed(3)} Å
                            </p>
                          </div>
                        ))}
                        {['alpha', 'beta', 'gamma'].map((param) => (
                          <div key={param} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">{param}</p>
                            <p className="text-base font-bold">
                              {result.lattice_parameters![param as keyof typeof result.lattice_parameters].toFixed(1)}°
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Atoms Table */}
                  {result.atoms && result.atoms.length > 0 && (
                    <div className="border-2 border-gray-200 rounded-xl p-5">
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Positions
                      </h3>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-2 text-left">#</th>
                              <th className="px-2 py-2 text-left">El</th>
                              <th className="px-2 py-2 text-left">X</th>
                              <th className="px-2 py-2 text-left">Y</th>
                              <th className="px-2 py-2 text-left">Z</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.atoms.map((atom, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-2 py-2">{idx + 1}</td>
                                <td className="px-2 py-2 font-bold">{atom.element}</td>
                                <td className="px-2 py-2">{atom.position[0].toFixed(3)}</td>
                                <td className="px-2 py-2">{atom.position[1].toFixed(3)}</td>
                                <td className="px-2 py-2">{atom.position[2].toFixed(3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                  <Atom className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  Ready to Generate
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Configure parameters and click generate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;