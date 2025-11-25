<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VR Demo</title>
    <style>
        body {
            font-family: system-ui, Segoe UI, Arial;
            background: #f6f7fb;
            margin: 0;
            padding: 24px
        }

        .card {
            width: 320px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, .08);
            overflow: hidden
        }

        .card img {
            width: 100%;
            height: 180px;
            object-fit: cover
        }

        .card-body {
            padding: 12px
        }

        .btn {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 6px;
            background: #2563eb;
            color: #fff;
            text-decoration: none
        }

        /* Modal */
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, .5);
            display: none;
            align-items: center;
            justify-content: center
        }

        .modal {
            background: #fff;
            padding: 18px;
            border-radius: 8px;
            max-width: 480px;
            width: 90%
        }

        .modal h3 {
            margin: 0 0 8px
        }

        .modal .actions {
            margin-top: 12px;
            text-align: right
        }
    </style>
</head>

<body>
    <h2>Demo Visor 360</h2>

    <div class="card">
        <img src="https://pannellum.org/images/alma.jpg" alt="Panorama ejemplo">
        <div class="card-body">
            <h3>Card de ejemplo</h3>
            <p>Haz click para abrir el modal y ver el visor 360.</p>
            <a href="#" id="openModal" class="btn">Ver en 360°</a>
        </div>
    </div>

    <div id="modal" class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
            <h3>Vista 360</h3>
            <p>Se redirigirá al visor 360 en una nueva vista. Puedes cambiar la imagen más tarde.</p>
            <div class="actions">
                <button id="cancel" class="btn" style="background:#9ca3af;margin-right:8px">Cancelar</button>
                <button id="go" class="btn">Abrir visor</button>
            </div>
        </div>
    </div>

    <script>
        const openBtn = document.getElementById('openModal');
        const modal = document.getElementById('modal');
        const cancel = document.getElementById('cancel');
        const go = document.getElementById('go');

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
        cancel.addEventListener('click', () => modal.style.display = 'none');

        // Imagen de prueba (puedes reemplazar por ruta relativa a /storage o a /public/images/tu.jpg)
        const sample = encodeURIComponent('https://pannellum.org/images/alma.jpg');

        go.addEventListener('click', () => {
            // Redirige a la ruta /vr con parametro ?image=
            window.location.href = '/vr?image=' + sample;
        });
    </script>
</body>

</html>
