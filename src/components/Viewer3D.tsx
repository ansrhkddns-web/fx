"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useGarmentStore } from "@/store/useGarmentStore";

export default function Viewer3D() {
    const { activeMaterial, sceneGraph } = useGarmentStore();

    const materialProps: Record<string, any> = {
        denim: { color: "#2B3C53", roughness: 0.8, metalness: 0.1 },
        cotton: { color: "#e5e7eb", roughness: 0.9, metalness: 0.1 },
        leather: { color: "#1f1814", roughness: 0.2, metalness: 0.8 },
        silk: { color: "#fecdd3", roughness: 0.1, metalness: 0.3, clearcoat: 1.0, clearcoatRoughness: 0.1 },
        wool: { color: "#6b7280", roughness: 1.0, metalness: 0.0 }
    };

    const matData = materialProps[activeMaterial] || materialProps.denim;

    return (
        <div className="w-full h-full relative cursor-move">
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                <color attach="background" args={["transparent"]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <Environment preset="city" />

                <group position={[0, -1, 0]}>
                    {/* Mannequin (Cylinder) continually visible as a prop */}
                    <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
                        <cylinderGeometry args={[0.3, 0.4, 3, 32]} />
                        <meshStandardMaterial color="#2d2d2d" roughness={0.7} />
                    </mesh>

                    {/* Garment Parts based on Scene Graph visibility */}
                    {sceneGraph['Jacket_Main_Body'] && (
                        <mesh castShadow receiveShadow position={[0, 1.6, 0.0]}>
                            <boxGeometry args={[1.2, 1.4, 0.6]} />
                            <meshPhysicalMaterial {...matData} />
                        </mesh>
                    )}

                    {sceneGraph['Sleeve_Left'] && (
                        <mesh castShadow receiveShadow position={[-0.8, 1.8, 0]} rotation={[0, 0, 0.5]}>
                            <cylinderGeometry args={[0.2, 0.15, 1.2, 16]} />
                            <meshPhysicalMaterial {...matData} />
                        </mesh>
                    )}

                    {sceneGraph['Sleeve_Right'] && (
                        <mesh castShadow receiveShadow position={[0.8, 1.8, 0]} rotation={[0, 0, -0.5]}>
                            <cylinderGeometry args={[0.2, 0.15, 1.2, 16]} />
                            <meshPhysicalMaterial {...matData} />
                        </mesh>
                    )}

                    <ContactShadows opacity={0.6} scale={10} blur={2} far={4} color="#000000" />
                </group>

                <OrbitControls
                    enablePan={true}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={2}
                    maxDistance={10}
                />
            </Canvas>

            {/* Floating 3D Tools */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-surface-dark/80 backdrop-blur border border-border-dark rounded-full px-4 py-2 shadow-2xl">
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition" title="Rotate">
                    <span className="material-symbols-outlined text-[20px]">3d_rotation</span>
                </button>
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition" title="Pan">
                    <span className="material-symbols-outlined text-[20px]">pan_tool</span>
                </button>
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition" title="Zoom">
                    <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </button>
                <div className="w-px bg-white/20 mx-1"></div>
                <button className="text-primary p-2 hover:bg-primary/20 rounded-full transition" title="Toggle Skeleton">
                    <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
                </button>
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition" title="Lighting">
                    <span className="material-symbols-outlined text-[20px]">light_mode</span>
                </button>
            </div>
        </div>
    );
}
