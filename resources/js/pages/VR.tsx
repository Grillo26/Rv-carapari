import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function VR() {
       const { props } = usePage();
       // 'image' is passed from the route
       const image: string | undefined = props.image;

       useEffect(() => {
              // Inject A-Frame script if not already present
              if (!(window as any).AFRAME) {
                     const s = document.createElement('script');
                     s.src = 'https://aframe.io/releases/1.4.1/aframe.min.js';
                     s.async = true;
                     document.head.appendChild(s);
              }
       }, []);

       const sample = 'https://pannellum.org/images/alma.jpg';
       let panoSrc = image || sample;
       if (panoSrc && !/^https?:\/\//i.test(panoSrc) && panoSrc.charAt(0) !== '/') {
              panoSrc = '/' + panoSrc;
       }

       return (
              <>
                     <Head>
                            <title>Visor 360 — CARAPARÍ</title>
                     </Head>

                     <div style={{ height: '100vh', margin: 0, background: '#000' }}>
                            {/* A-Frame elements will work once aframe script loads */}
                            <a-scene vr-mode-ui="enterVRButton: true" embedded style={{ height: '100%' }}>
                                   <a-assets>
                                          <img id="pano" src={panoSrc} crossOrigin="anonymous" />
                                   </a-assets>

                                   <a-sky id="sky" src="#pano"></a-sky>
                            </a-scene>

                            <a href="/" style={{ position: 'fixed', left: 12, top: 12, zIndex: 9999, padding: '8px 12px', background: 'rgba(255,255,255,0.9)', borderRadius: 6, textDecoration: 'none', color: '#000' }}>← Volver</a>
                     </div>
              </>
       );
}
