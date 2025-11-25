<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Visor 360</title>
    <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            background: #000
        }

        a-scene {
            height: 100vh
        }

        .back-btn {
            position: fixed;
            left: 12px;
            top: 12px;
            z-index: 9999;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 6px;
            text-decoration: none;
            color: #000
        }
    </style>
</head>

<body>
    <a href="/vr-demo" class="back-btn">← Volver</a>

    <a-scene vr-mode-ui="enterVRButton: true" embedded>
        <a-assets>
            <img id="pano" src="" crossorigin="anonymous">
        </a-assets>

        <a-sky id="sky" src="#pano"></a-sky>
    </a-scene>

    <script>
        // Leer ?image= desde la URL; usar imagen de ejemplo si falta
        const params = new URLSearchParams(window.location.search);
        const sample = 'https://pannellum.org/images/alma.jpg';
        let imageUrl = params.get('image') || sample;

        // Si la URL no parece ser absoluta, interpretar como relativa a /storage o /public
        if (imageUrl && !/^https?:\/\//i.test(imageUrl) && imageUrl.charAt(0) !== '/') {
            imageUrl = '/' + imageUrl;
        }

        const pano = document.getElementById('pano');
        pano.src = imageUrl;

        pano.addEventListener('error', () => {
            if (pano.src !== sample) {
                console.warn('No se pudo cargar la imagen, usando ejemplo.');
                pano.src = sample;
                // Notificación ligera para el usuario
                setTimeout(() => alert(
                    'No se pudo cargar la imagen proporcionada. Se ha usado una imagen de ejemplo.'), 50);
            }
        });
    </script>
</body>

</html>
