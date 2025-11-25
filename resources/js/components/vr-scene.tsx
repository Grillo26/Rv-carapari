
import { VRButton, XR /*, Controllers*/ } from '@react-three/xr';
import { Canvas } from '@react-three/fiber';
import { Plane, Text, Image } from '@react-three/drei';

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1800&q=80&auto=format&fit=crop',
];

const PLACE_LIST = [
    { title: 'Catedral', slug: 'catedral', img: HERO_IMAGES[0], description: 'La imponente catedral histórica en el corazón de Caraparí.', rating: 4.8, reviews: 230 },
    { title: 'Plaza Principal', slug: 'plaza-principal', img: HERO_IMAGES[1], description: 'Punto de encuentro con vida, ferias y actividades culturales.', rating: 4.6, reviews: 142 },
    { title: 'Mercado Central', slug: 'mercado-central', img: HERO_IMAGES[2], description: 'Sabores locales y artesanías en un ambiente tradicional.', rating: 4.4, reviews: 98 },
    { title: 'Plaza Moto Méndez', slug: 'plaza-moto-mendez', img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1200&q=80&auto=format&fit=crop', description: 'Espacio moderno ideal para eventos al aire libre.', rating: 4.2, reviews: 64 },
    { title: 'Avenida Canal', slug: 'avenida-canal', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80&auto=format&fit=crop', description: 'Paseo arbolado y comercios locales con mucho encanto.', rating: 4.3, reviews: 77 },
    { title: 'Catedral (Antigua)', slug: 'catedral-antigua', img: 'https://images.unsplash.com/photo-1498550744923-4a5c0c7b8f3f?w=1200&q=80&auto=format&fit=crop', description: 'Otra vista histórica de la catedral y sus alrededores.', rating: 4.5, reviews: 55 },
];

function Card3D({ place, ...props }: { place: typeof PLACE_LIST[0], position: [number, number, number], rotation: [number, number, number] }) {
    return (
        <group {...props}>
            <Plane args={[2, 2.8]} rotation={[0, 0, 0]}>
                <meshStandardMaterial color="rgb(38 38 38)" side={2} />
            </Plane>

            <Text
                position={[0, -0.1, 0.01]}
                color="white"
                fontSize={0.15}
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
            >
                {place.title}
            </Text>
            <Text
                position={[0, -0.4, 0.01]}
                color="rgb(163 163 163)"
                fontSize={0.08}
                anchorX="center"
                anchorY="top"
                textAlign="center"
                maxWidth={1.8}
                lineHeight={1.4}
            >
                {place.description}
            </Text>
        </group>
    );
}

function CardsScene() {
    const radius = 4;
    return (
        <>
            <ambientLight intensity={0.8} />
            <pointLight position={[0, 2, 0]} intensity={1} />
            {PLACE_LIST.map((place, index) => {
                const angle = (index / PLACE_LIST.length) * Math.PI * 2;
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;
                const y = 1.6;

                // Calculate rotation to make the card face the center
                const rotationY = angle + Math.PI;

                return (
                    <Card3D
                        key={place.slug}
                        place={place}
                        position={[x, y, z]}
                        rotation={[0, rotationY, 0]}
                    />
                );
            })}
        </>
    );
}


export function VRScene() {
    return (
        <div style={{ height: '400px', width: '100%' }}>
            <Canvas camera={{ position: [0, 1.6, 6], fov: 75 }}>
                <CardsScene />
            </Canvas>
        </div>
    );
}
