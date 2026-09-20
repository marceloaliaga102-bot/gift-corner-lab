import { Product, CartItem } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'cuponera-amor-3d',
    code: 'GCL-VIR-01',
    name: 'Cuponera de Amor Interactiva & Carta Digital 3D',
    category: 'virtuales',
    productType: 'virtual',
    price: 29.90,
    originalPrice: 45.00,
    discountBadge: '-33% OFF',
    badgeLabel: '⚡ PRODUCTO VIRTUAL',
    badgeType: 'virtual',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6hxYv49seo3UVpRA_T6ZSAvNhHmZvDYkIWUqs72mZn9TRFKUr9AmMOcC0w1prxdHV_gWw6RPMVfmZU0HSLKkkj8Ub-93no-VPaM1QY86fRx0KuHYy06R_AjcI1LlTYrPVm3bO3MbcUlmzU7AnldSXafLwTbRXjGpAwllytV6UWdsBdQHjFYFOrfTro3GHeIm57dmrAmhtNqtCnsIx34TPCrsVGykmO5UWqSGAEhOwgUahOUcA75st0w',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjim4OXoQzDoIFDA9ZwcDqlaRJkyam5y98R0OSy18jsc1nO21Wpo52XsZ4SifzBOtVvwk297zAQFu6AAkC6RVfGVrJUPwK6t3Q_ukNqgU9KlKo8to8m-Yj1W3tUTNmwThTyXwFXswJS4CO1r8FV1tNmnU2DH2aWN_joc6qQcT6tof2TuLqU7nfHfV_e2VwwbQJ_v9RvfAz736HKTGcE0eyw-u4P9qdE_kkzD8G-jaBPK995F8y36Ir8A',
    altText: 'Cuponera de Amor Interactiva 3D con cartas digitales brillantes',
    description: 'Generador de enlaces único con video preview interactivo, animaciones de apertura de sobre y música ambiental personalizable.',
    fullDetails: 'Un regalo romántico digital inolvidable. Al abrir el enlace personalizado, tu persona especial verá una carta 3D que se desdobla con música ambiental, efectos de corazones y 12 cupones canjeables (masajes, cenas, escapadas sorpresa o cupones libres). Puedes personalizar los textos y fotos directamente.',
    deliveryInfo: 'Descarga inmediata al pagar',
    has3DPreview: true,
    downloadFile: {
      name: 'cuponera-amor-digital-3d.html',
      type: 'text/html',
      size: 14280,
      isHtml: true,
      dataUrl: 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cuponera de Amor 3D - Gift Corner Lab</title>
<style>
  body { margin: 0; background: #0f172a; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
  .card { background: #1e293b; padding: 32px; border-radius: 24px; border: 2px solid #ec4899; box-shadow: 0 10px 40px rgba(236,72,153,0.3); max-width: 480px; }
  h1 { color: #f472b6; margin-top: 0; }
  .coupon { background: #334155; padding: 12px; margin: 10px 0; border-radius: 12px; border-left: 4px solid #ec4899; }
</style>
</head>
<body>
<div class="card">
  <h1>💖 Cuponera de Amor Digital 3D</h1>
  <p>¡Felicidades! Este es tu archivo interactivo adquirido en <strong>Gift Corner Lab</strong>.</p>
  <div class="coupon">🎁 Cupón #1: Cena romántica sorpresa donde tú elijas</div>
  <div class="coupon">💆 Cupón #2: Sesión de masajes de 30 minutos sin interrupciones</div>
  <div class="coupon">🎬 Cupón #3: Noche de películas con palomitas y sin quejarse</div>
  <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Creado con amor por Marcelo Aliaga & Angely en Gift Corner Lab</p>
</div>
</body>
</html>`)
    },
    features: [
      'Animación de apertura de sobre 3D',
      '12 cupones interactivos personalizables',
      'Música de fondo a elección',
      'Descarga directa HTML al instante',
      'Compatible con cualquier smartphone y ordenador'
    ]
  },
  {
    id: 'lampara-acrilica-spotify',
    code: 'GCL-FIS-02',
    name: 'Lámpara Acrílica Personalizada Spotify',
    category: 'fisicos',
    productType: 'fisico',
    price: 79.90,
    badgeLabel: '📦 PRODUCTO FÍSICO',
    badgeType: 'fisico',
    secondaryBadge: 'Stock: 14 uds.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj9dUG6_jdgrDsRtaMZOlRutCI1APxtWLA6ggdxFt13uCmYyfb6WFagkjGofJ_wzm7-kHb-DBAulTcj-4dJhDPbN16NaigATVGLk-7MoDwR6EFfXPP2oQvS1GPDc7uU87WFWUoarcMIxuQ6sgyjT4RVmhhW_DqovPqIiy-cetpi_iA96j9h7aIABx7ryel39M-9qWmmGMqEur4Lxm20IYJbOJJRt6caF6aWJ_b_KLn-sGnOC2o39pFcQ',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKeoHX4avlvdnDN90j-z_kl2_gI2lg4T5U7lRexhwIeCjHuZvnIjbb7XaE5OAwS6Rhm8Bu5I0_0kNoG065aWO8f0fWU9GKnKSoStM9XqEAHqXn4a6Zf60K827QtuX4pL0pxnUopE8DBIKwuZ3p1gCgxNkni6oTgwJO-kcNBxI5xpCklvm9APn8eoHqItKiYjLO5amUQLS6EHPR30N4CaG5IJU0kxiEqC4EGeYhxjFdwVEjSS4-Jh3duA',
    altText: 'Lámpara de acrílico con código de Spotify en base de madera con luz cálida',
    description: 'Código escaneable real, base de madera LED cálida. Coordinación de entrega personal por WhatsApp.',
    fullDetails: 'Grabado láser de alta fidelidad sobre placa acrílica óptica de 5mm. Al escanear el código desde la app de Spotify con la cámara del móvil, reproduce instantáneamente su canción especial. Base artesanal de madera maciza tratada en el taller de Marcelo con iluminación LED blanco cálido 3000K.',
    deliveryInfo: 'Entrega en punto de encuentro o taller',
    stock: 14,
    pickupLocations: [
      'Plaza Central / Parque Principal',
      'Estación Central / Estación de Tren',
      'C.C. Mall Aventura - Entrada Principal',
      'Taller Gift Corner Lab (Coordinación previa)'
    ],
    features: [
      'Código Spotify 100% escaneable',
      'Base de madera de haya maciza con interruptor USB',
      'Caja de regalo rígida con lazo satinado incluida',
      'Coordinación directa por WhatsApp con el creador'
    ]
  },
  {
    id: 'piedra-mascota-sombrerito',
    code: 'GCL-PQS-03',
    name: 'Piedra Mascota con Certificado & Sombrerito',
    category: 'porquesi',
    productType: 'fisico',
    price: 19.90,
    badgeLabel: '🦄 PORQUE SÍ',
    badgeType: 'porquesi',
    secondaryBadge: 'Sin propósito útil',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJWA8MMxtlWYKr6vm0IPuppdQcH5-ELzNMCMRdI7fJS2ZSCLu4gcA3YSGIgLkIiveAkTV430LXCTjN3iZC_pGIkWdPKqOHy9nrl01wVDGeutUfW8pnOnd1o8x22xiuY6oc_ZwvpGHHRfo8kUtVLOZqZ1dZcnimrtczQlFRKVkglgES4q_Ima-RYrbKqr_oHSY7SIdIWV2D__aGiptaiLyc8OL9uglIR96lEr29neOeKFsSrIqQuhVu1A',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGaoWq-z_nOGXX0FecywL4Usg2WaR9LFMdpkFSAg8dZpZimR84AZ0TWAe1cpiiy9tFGaULYUIZJ9GEfu4awh4saSEcCccroJcRoOVPzjrp73tkbp2mOt3kDuULv1WOhJNQ3amJKG_qfQdlhtCe447R09MPnRiFb0s9U9ugW54Q7-yMP_bJj-iz2wT2JnEitPfm2KQtA76URJNx21hcij1x2OAvCpnVTS0YfaLcMiz5ZmwKJ65vRCCgiA',
    altText: 'Piedra mascota con sombrerito tejido a mano y ojitos saltones en caja de terciopelo',
    description: '"Sin ningún propósito real, pero te alegrará la existencia". Incluye partida de nacimiento notariada y sombrerito tejido a mano.',
    fullDetails: 'La cúspide de la colección PORQUE SÍ. Cada piedra es seleccionada a mano en ríos de montaña, pulida con cariño y bautizada oficialmente. Viene con sombrerito tejido a crochet por Angely en colores aleatorios, ojos móviles y un certificado oficial de adopción sellado en relieve.',
    deliveryInfo: 'Entrega coordinada en punto de encuentro',
    stock: 25,
    pickupLocations: [
      'Plaza Central / Parque Principal',
      'Taller Gift Corner Lab'
    ],
    features: [
      'No necesita comida ni paseos a las 6 am',
      'Sombrerito de lana tejido a mano',
      'Certificado de nacimiento oficial con número de serie',
      'Cama de terciopelo y caja con orificios de respiración'
    ]
  },
  {
    id: 'pagina-web-conmemorativa',
    code: 'GCL-VIR-04',
    name: 'Página Web Conmemorativa Personalizada',
    category: 'virtuales',
    productType: 'virtual',
    price: 49.90,
    originalPrice: 79.00,
    badgeLabel: '⚡ PRODUCTO VIRTUAL',
    badgeType: 'virtual',
    secondaryBadge: 'Hosting 1 año inc.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPS_AoF3rxoeWyevNyeAl_9KAcEIDWL2DxsR_EYRaAPvZkcAfRn8Fc8FNpD3Fyo0oh6BKa6yjP6rm7sFrVedr_UHwOSX8KU1qaL63elogKoIIox6TKuT043p4mNEAuPDH1gSZPuSc_5hbv--tgJA1iUBWh81--z0e01h-FBQ4V4fubvCqQDICUqXV4LCMkCvxmyqud_RD29nWPZbj0Iy4Cn6HMYguGdEbXnfAzNJjMk2A66lo2hKfBA',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPS_AoF3rxoeWyevNyeAl_9KAcEIDWL2DxsR_EYRaAPvZkcAfRn8Fc8FNpD3Fyo0oh6BKa6yjP6rm7sFrVedr_UHwOSX8KU1qaL63elogKoIIox6TKuT043p4mNEAuPDH1gSZPuSc_5hbv--tgJA1iUBWh81--z0e01h-FBQ4V4fubvCqQDICUqXV4LCMkCvxmyqud_RD29nWPZbj0Iy4Cn6HMYguGdEbXnfAzNJjMk2A66lo2hKfBA',
    altText: 'Laptop mostrando página web conmemorativa con fotos y constelaciones interactivas',
    description: 'Plantilla interactiva premium + código fuente HTML entregado al instante. Línea del tiempo, contador y música.',
    fullDetails: 'Creamos un rincón digital único en internet para celebrar su aniversario, cumpleaños o fecha especial. Incluye contador en tiempo real de días/horas compartidas, mapa estelar de la noche que se conocieron, reproductor de audio con su canción favorita y galería fotográfica interactiva.',
    deliveryInfo: 'Descarga inmediata al pagar',
    downloadFile: {
      name: 'pagina-web-conmemorativa.html',
      type: 'text/html',
      size: 28400,
      isHtml: true,
      dataUrl: 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Nuestra Historia de Amor - Gift Corner Lab</title>
<style>
body { background: #0b0f19; color: #f1f5f9; font-family: system-ui; text-align: center; padding: 50px 20px; }
.box { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid #38bdf8; }
h1 { color: #38bdf8; }
</style>
</head>
<body>
<div class="box">
  <h1>✨ Página Web Conmemorativa</h1>
  <p>Archivo HTML personalizado para tu aniversario y recuerdos mágicos.</p>
  <p>Desarrollado con dedicación en <strong>Gift Corner Lab</strong>.</p>
</div>
</body>
</html>`)
    },
    features: [
      'Código fuente HTML completo y listo para abrir',
      'Contador en tiempo real de tiempo juntos',
      'Galería de hasta 50 fotografías en alta resolución',
      'Acceso y descarga de por vida'
    ]
  },
  {
    id: 'caja-explosiva-dulces-polaroid',
    code: 'GCL-FIS-05',
    name: 'Caja Explosiva Sorpresa Dulces & Polaroid',
    category: 'fisicos',
    productType: 'fisico',
    price: 89.90,
    badgeLabel: '📦 PRODUCTO FÍSICO',
    badgeType: 'fisico',
    secondaryBadge: '12 Fotos Incluidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfak979cVtd7dplQ-2RdVCfRFiq2erGCW8oXDboY2sfiJux0J8EvVNlw9fZHDYAeCmdZWRSr2N_AFtZhyS7lUVUKP_B_C4JKVcDgLzIAmGFPakejmBIdfDBAZgabfSbLhAF4idY3gRH09RukAj2qe625BjNLix1GJQ46iO5wR3CyJuYcrnMyUm7IjflFkChH60tDk6IowQY8n16-42vFVw1osidaUu_aNSKlw1HExS3O1N5-OgZpGLEg',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfak979cVtd7dplQ-2RdVCfRFiq2erGCW8oXDboY2sfiJux0J8EvVNlw9fZHDYAeCmdZWRSr2N_AFtZhyS7lUVUKP_B_C4JKVcDgLzIAmGFPakejmBIdfDBAZgabfSbLhAF4idY3gRH09RukAj2qe625BjNLix1GJQ46iO5wR3CyJuYcrnMyUm7IjflFkChH60tDk6IowQY8n16-42vFVw1osidaUu_aNSKlw1HExS3O1N5-OgZpGLEg',
    altText: 'Caja explosiva hexagonal abierta con fotos polaroid y chocolates de alta gama',
    description: 'Caja con múltiples capas desplegables. Impresión química de 12 fotos tipo Polaroid y selección de chocolates importados.',
    fullDetails: 'Al retirar la tapa superior, las 4 capas de paredes caen en cascada revelando recuerdos fotográficos, mensajes ocultos en pequeños sobres y un compartimento central con bombones finos y mini luces LED de hadas.',
    deliveryInfo: 'Entrega personal coordinada por WhatsApp',
    stock: 8,
    pickupLocations: [
      'Plaza Central / Parque Principal',
      'C.C. Mall Aventura - Entrada Principal',
      'Taller Gift Corner Lab'
    ],
    features: [
      '12 fotografías en papel fotográfico Fuji resistente al agua',
      'Caja de 4 niveles en cartulina mate de 350g',
      'Surtido de bombones Ferrero Rocher y Lindt',
      'Coordinación directa para recogida y entrega'
    ]
  },
  {
    id: 'boton-panico-miau',
    code: 'GCL-PQS-06',
    name: "Botón de Pánico que solo dice 'Miau'",
    category: 'porquesi',
    productType: 'fisico',
    price: 24.90,
    badgeLabel: '🦄 PORQUE SÍ',
    badgeType: 'porquesi',
    secondaryBadge: 'Baterías AAA incluidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbrQuBvJPXkHMNYkO0RLWnFto82XQ_9Ey1AJjQuF9khnEIdEOGWw2kVK0YKFNaAz7kVq3dyCvwUzVcap_7av8MOm3GClem8i68AQfsEX_Shm-GmLLsQFBPfG9nuuAOXKTxz1bFYrT4cvqtJ1yHrQUoDowv4R02XUhfFpzPt_i5vWye57Vi7EZ1oYZpahlPBGfX3JRKlZc2cm92mAW3oQ2LOJpuKgaZnDGqiWJAMVnfyE2ufGuvdTmj5A',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbrQuBvJPXkHMNYkO0RLWnFto82XQ_9Ey1AJjQuF9khnEIdEOGWw2kVK0YKFNaAz7kVq3dyCvwUzVcap_7av8MOm3GClem8i68AQfsEX_Shm-GmLLsQFBPfG9nuuAOXKTxz1bFYrT4cvqtJ1yHrQUoDowv4R02XUhfFpzPt_i5vWye57Vi7EZ1oYZpahlPBGfX3JRKlZc2cm92mAW3oQ2LOJpuKgaZnDGqiWJAMVnfyE2ufGuvdTmj5A',
    altText: "Botón de emergencia industrial rosa fosforescente con palabra MIAU",
    description: '"Totalmente innecesario. Cómpralo ya." Emite 12 variantes de maullidos con reverb de catedral y eco dramático estéreo.',
    fullDetails: '¿Día estresante en la oficina? ¿Silencio incómodo en una reunión? Presiona el gran botón pulsador industrial para disparar un estruendoso "MIAUUUUU" con efecto de reverberación. El antídoto infalible contra la monotonía diaria.',
    deliveryInfo: 'Entrega en punto de referencia',
    stock: 40,
    pickupLocations: [
      'Plaza Central / Parque Principal',
      'Taller Gift Corner Lab'
    ],
    features: [
      'Pulsador industrial de alta resistencia (aguanta golpes de frustración)',
      '12 tonos de maullidos (tierno, dramático, enfadado, operístico)',
      'Altavoz frontal de 3W con sonido nítido',
      'Almohadilla antideslizante en la base'
    ]
  },
  {
    id: 'pack-stickers-instagram',
    code: 'GCL-VIR-07',
    name: 'Pack 100 Stickers & Filtros Instagram',
    category: 'virtuales',
    productType: 'virtual',
    price: 15.00,
    badgeLabel: '⚡ PRODUCTO VIRTUAL',
    badgeType: 'virtual',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP7HJojDTtKjGOeqNUcuYj-qEP4XbtxqXyePPw7wqiW8zvBFekN52qBieucD3eDCgoZSDvSeiSX-vX80cX72BUCbLDKbLkn8ucFQ3ISeYmfr1ueRfUw9i8sfFoEvp6w3SFE_gpAi3ASRPbOl5Wlq7aRnVfOKx_oQF8qoAzJv0ny3Cfs1ccOedxhfmfC0iYSGcl7waZ3TMbcMknA3GGfaT15LpkGYYs1Tzrt2N41upfvIeofYXjNaQWTQ',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP7HJojDTtKjGOeqNUcuYj-qEP4XbtxqXyePPw7wqiW8zvBFekN52qBieucD3eDCgoZSDvSeiSX-vX80cX72BUCbLDKbLkn8ucFQ3ISeYmfr1ueRfUw9i8sfFoEvp6w3SFE_gpAi3ASRPbOl5Wlq7aRnVfOKx_oQF8qoAzJv0ny3Cfs1ccOedxhfmfC0iYSGcl7waZ3TMbcMknA3GGfaT15LpkGYYs1Tzrt2N41upfvIeofYXjNaQWTQ',
    altText: 'Pantalla de móvil mostrando stickers estéticos y filtros para historias de Instagram',
    description: 'PNG transparentes listos para historias de cumpleaños épicas, filtros Spark AR listos para publicar y tutorial paso a paso.',
    fullDetails: 'El kit definitivo para darle vida y estilo aesthetic a tus historias de Instagram, TikTok y reels. Diseñado con tipografías de autor, texturas holográficas, cintas washi y destellos brillantes para copiar y pegar directamente desde tu galería.',
    deliveryInfo: 'Descarga inmediata al pagar',
    downloadFile: {
      name: 'pack-100-stickers-instagram.zip',
      type: 'application/zip',
      size: 45600,
      isHtml: false,
      dataUrl: 'data:application/zip;base64,UEsDBBQAAAAIAAAAAAAAAAAAAAAAAAAAAAA='
    },
    features: [
      '100 archivos PNG con transparencia a 300 DPI',
      'Preset Lightroom para fotos con tono cálido cinematográfico',
      'Descarga inmediata al confirmar tu pago',
      'Acceso vitalicio a futuras actualizaciones de stickers'
    ]
  },
  {
    id: 'mini-proyector-constelaciones',
    code: 'GCL-FIS-08',
    name: 'Mini Proyector Portátil Constelaciones USB',
    category: 'fisicos',
    productType: 'fisico',
    price: 119.00,
    originalPrice: 149.00,
    badgeLabel: '📦 PRODUCTO FÍSICO',
    badgeType: 'fisico',
    secondaryBadge: 'Oferta Flash',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIz_IhP029jvZGQO0Cv9bAebtrG16VokNvqcl_6iJ6UQ4RrEOl6sRUEwCZzu-1jlir0bFuf32giQDWpg2uBLukIElvsAxGXnl3iqZ9kWTwD7tsPaWCnKCVg7pLKguOj0Prs5cykvD_k4Mx24EFOLyF9tkeWnecCDnVIdSOsY5KL6dwOf99HJEuO-gDuM9tIsfahmZwkUw-Lj9g6tV4L5Vf64D5BGBDQ_fbVxzj_COohXy0NZPDxFM53A',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIz_IhP029jvZGQO0Cv9bAebtrG16VokNvqcl_6iJ6UQ4RrEOl6sRUEwCZzu-1jlir0bFuf32giQDWpg2uBLukIElvsAxGXnl3iqZ9kWTwD7tsPaWCnKCVg7pLKguOj0Prs5cykvD_k4Mx24EFOLyF9tkeWnecCDnVIdSOsY5KL6dwOf99HJEuO-gDuM9tIsfahmZwkUw-Lj9g6tV4L5Vf64D5BGBDQ_fbVxzj_COohXy0NZPDxFM53A',
    altText: 'Mini proyector astronauta proyectando nebulosas moradas y estrellas láser en el techo',
    description: 'Nebulosa dinámica en 8 colores, temporizador y control remoto. Entrega física coordinada por WhatsApp.',
    fullDetails: 'Convierte cualquier habitación en un observatorio espacial privado. Su cabeza magnética gira 360° para proyectar nebulosas multidimensionales y estrellas verdes de precisión sobre techos o paredes. Incluye mando a distancia con ajuste de velocidad, brillo y temporizador de apagado de 45 o 90 minutos.',
    deliveryInfo: 'Puntos de recogida acordados por WhatsApp',
    stock: 9,
    pickupLocations: [
      'Plaza Central / Parque Principal',
      'Estación Central / Estación de Tren',
      'C.C. Mall Aventura - Entrada Principal',
      'Taller Gift Corner Lab'
    ],
    features: [
      'Proyección de nebulosas en 8 modos cromáticos',
      'Láser de estrellas estelares con efecto respiración',
      'Cabeza magnética giratoria 360 grados',
      'Coordinación de entrega directa vía WhatsApp'
    ]
  }
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  { product: PRODUCTS[0], quantity: 1 } // Cuponera de Amor 3D (Virtual)
];

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WxWi_NSsuTNnxr-UlDMCa2UmLMPwOBdPSB7sqKuILYhzx5cPbeEjwQA-9XSRkuE16ub49pAz4ZqRok9N1aCv7YnAfdR5sTtsDSUWOQI8-Xfq3PBE_pgSETxahI1u44vqPDN6JrcQ10YWHAg8ncOE0tl5lXIbv_TQc0wdiaTmHsSxAQ6yxcQTpbYuD7d_-z6sGiSKxkjeGZnliBGlJZiXAiSgZuH0R_0_IyYC65WCbpZ2SB6SdYApgCGQQ';
