import React, { useState, useEffect } from 'react';
import { Product, User, ProductComment, ProductRating } from '../../types';
import { 
  X, ShoppingCart, Check, PlayCircle, Clock, Box, Zap, Sparkles, Video, FileCode, ExternalLink,
  MapPin, MessageCircle, Star, MessageSquare, ChevronDown, ChevronUp, Send, User as UserIcon
} from 'lucide-react';
import { sfx } from '../../utils/audio';
import { getStoredComments, saveStoredComment, getStoredRatings, saveStoredRating } from '../../utils/storage';

interface ProductDetailModalProps {
  product: Product | null;
  currentUser?: User | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenPreview3D?: () => void;
  onOpenAuthModal?: () => void;
}

// Helper to parse and format video URLs for unblocked playback
function getEmbedVideoInfo(url: string): { type: 'youtube' | 'video'; embedUrl: string } {
  if (!url) return { type: 'video', embedUrl: '' };
  const clean = url.trim();

  // YouTube match (watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // Google Drive: /view -> /preview
  if (clean.includes('drive.google.com/file/d/')) {
    const driveMatch = clean.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/i);
    if (driveMatch && driveMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
      };
    }
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'youtube',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`
    };
  }

  // Direct video file (MP4, WEBM, etc.)
  return {
    type: 'video',
    embedUrl: clean
  };
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentUser,
  onClose,
  onAddToCart,
  onOpenPreview3D
}) => {
  // Comments and Ratings state
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [ratings, setRatings] = useState<ProductRating[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  
  // New comment form state
  const [commentAuthor, setCommentAuthor] = useState<string>('');
  const [commentRating, setCommentRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');
  const [commentSuccess, setCommentSuccess] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Load persisted comments & ratings
    const storedComments = getStoredComments(product.id);
    const storedRatings = getStoredRatings(product.id);

    // Initial seed if product has no ratings yet
    if (storedRatings.length === 0) {
      const initialRating = [
        { userId: 'default-1', rating: 5 },
        { userId: 'default-2', rating: 5 },
        { userId: 'default-3', rating: 4 }
      ];
      setRatings(initialRating);
    } else {
      setRatings(storedRatings);
    }

    setComments(storedComments);
    if (currentUser) {
      setCommentAuthor(currentUser.name);
      const myRating = storedRatings.find(r => r.userId === currentUser.id);
      if (myRating) {
        setUserRating(myRating.rating);
        setHasRated(true);
      }
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [product, currentUser]);

  if (!product) return null;

  const isVirtual = product.productType === 'virtual' || product.category === 'virtuales';
  const isPhysical = product.productType === 'fisico' || product.category === 'fisicos' || product.category === 'porquesi';
  const isPorqueSi = product.category === 'porquesi';

  // Calculate rating stats
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0 
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1)
    : '5.0';

  const handleRateProduct = (star: number) => {
    setUserRating(star);
    setHasRated(true);
    sfx.playChime();

    const userId = currentUser ? currentUser.id : `guest-${Date.now()}`;
    const newRatingItem: ProductRating = { userId, rating: star };
    const updated = saveStoredRating(product.id, newRatingItem);
    setRatings(updated);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = commentAuthor.trim() || (currentUser ? currentUser.name : 'Cliente de Gift Corner');
    const newComment: ProductComment = {
      id: `comment-${Date.now()}`,
      userName: authorName,
      userEmail: currentUser?.email,
      rating: commentRating,
      comment: commentText.trim(),
      createdAt: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = saveStoredComment(product.id, newComment);
    setComments(updated);
    setCommentText('');
    setCommentSuccess('¡Tu reseña ha sido publicada con éxito!');
    sfx.playChime();

    // Also update ratings with this comment rating
    const userId = currentUser ? currentUser.id : `commenter-${Date.now()}`;
    const updatedRatings = saveStoredRating(product.id, { userId, rating: commentRating });
    setRatings(updatedRatings);

    setTimeout(() => {
      setCommentSuccess('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#191b23] border border-white/10 p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[88vh] sm:max-h-[90vh] flex flex-col custom-scrollbar">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#272a32] text-[#e1e2ec] hover:bg-[#32353d] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Image & Badges */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-[#272a32] border border-white/5">
              <img
                src={product.imageUrl}
                alt={product.altText}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {product.has3DPreview && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.playChime();
                    if (onOpenPreview3D) onOpenPreview3D();
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#0b0e15]/90 backdrop-blur-md text-[#e1e2ec] hover:text-white hover:bg-[#7c3aed] text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10 transition-colors"
                >
                  <PlayCircle className="w-4 h-4 text-[#d2bbff]" />
                  <span>Probar Preview 3D</span>
                </button>
              )}
            </div>
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-black/80 text-[#4cd7f6] border border-[#4cd7f6]/50 font-mono text-xs font-bold">
                  COD: {product.code || `GCL-${product.id.slice(0, 4).toUpperCase()}`}
                </span>
                {isVirtual && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#03b5d3] text-[#001f26] flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {product.category === 'fisicos' && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#272a32] text-[#4cd7f6] flex items-center gap-1 border border-[#4cd7f6]/40">
                    <Box className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {isPorqueSi && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#ffb2b7] text-[#67001b] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {product.badgeLabel}
                  </span>
                )}
                {product.secondaryBadge && (
                  <span className="px-2 py-0.5 rounded text-[9px] pixel-badge bg-[#272a32] text-[#ccc3d8]">
                    {product.secondaryBadge}
                  </span>
                )}
              </div>

              <h2 className="font-display text-base sm:text-xl font-bold text-white leading-tight">
                {product.name}
              </h2>

              {/* Star Rating Overview Banner */}
              <div className="flex items-center gap-2 mt-2 py-1 px-2.5 rounded-xl bg-[#10131a] border border-white/5 w-max">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(Number(avgRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-300 font-mono">{avgRating}</span>
                <span className="text-[11px] text-[#958da1]">({totalRatings} valoraciones)</span>
              </div>

              <div className="flex items-baseline gap-2 mt-2.5">
                <span className={`font-display text-xl sm:text-2xl font-extrabold ${
                  isPorqueSi ? 'text-[#ffb2b7]' : 'text-white'
                }`}>
                  S/. {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-[#958da1] line-through font-mono">
                    S/. {product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-[#4cd7f6] flex items-center gap-1 ml-2 font-mono">
                  <Clock className="w-3 h-3" /> {product.deliveryInfo}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
              {product.fullDetails}
            </p>

            {/* Interactive Rating Widget */}
            <div className="p-3 rounded-xl bg-[#10131a]/90 border border-amber-500/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#e1e2ec]">¿Qué te parece este producto?</span>
                {hasRated && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> ¡Puntuado con {userRating} estrellas!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#958da1]">Calificar:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRateProduct(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded hover:scale-125 transition-transform cursor-pointer"
                      title={`${star} de 5 estrellas`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          star <= (hoverRating || userRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-amber-300 font-bold ml-1">
                  {(hoverRating || userRating)} / 5
                </span>
              </div>
            </div>

            {/* Video Preview if available */}
            {product.videoUrl && (() => {
              const videoInfo = getEmbedVideoInfo(product.videoUrl);
              return (
                <div className="p-3.5 rounded-2xl bg-[#10131a] border border-[#7c3aed]/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d2bbff] flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#d2bbff]" /> Video Demostrativo
                    </span>
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#4cd7f6] hover:underline flex items-center gap-1"
                    >
                      <span>Abrir en enlace externo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner relative">
                    {videoInfo.type === 'youtube' ? (
                      <iframe
                        src={videoInfo.embedUrl}
                        title={product.name}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <video
                        src={videoInfo.embedUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      >
                        Tu navegador no soporta reproducción directa de video.
                      </video>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Downloadable Attachment Notice if available (Virtual) */}
            {product.downloadFile && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">
                      Entrega Digital Instantánea ({product.downloadFile.name})
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      Podrás descargarlo directamente en tu cuenta tras confirmar el pago.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {(product.downloadFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            {/* Physical Pickup Locations & WhatsApp coordination notice */}
            {isPhysical && (
              <div className="p-3.5 rounded-xl bg-[#03b5d3]/10 border border-[#03b5d3]/30 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4cd7f6] flex items-center gap-1.5 font-mono">
                    <MapPin className="w-4 h-4 text-[#4cd7f6]" /> Entrega Física Coordinada
                  </span>
                  <span className="text-[9px] pixel-badge px-2 py-0.5 rounded bg-[#03b5d3]/20 text-[#4cd7f6]">
                    Presencial
                  </span>
                </div>
                
                <p className="text-[11px] text-[#ccc3d8] leading-tight">
                  Se coordina por WhatsApp indicando el código único: <strong className="text-[#4cd7f6] font-mono">{product.code}</strong>. Puntos de encuentro disponibles:
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(product.pickupLocations && product.pickupLocations.length > 0
                    ? product.pickupLocations
                    : ['Plaza Central / Parque Principal', 'Estación Central / Tren', 'Taller Gift Corner Lab']
                  ).map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#191b23] border border-white/10 text-white text-[11px] flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#4cd7f6]" /> {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
              <span className="text-xs font-display font-bold text-[#e1e2ec]">
                Características &amp; Beneficios:
              </span>
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#ccc3d8]">
                  <Check className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onAddToCart(product);
                  onClose();
                }}
                className={`w-full flex-1 py-3 px-4 rounded-xl font-display text-xs font-bold pixel-btn flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isPorqueSi
                    ? 'bg-[#ffb2b7] hover:bg-white text-[#67001b]'
                    : isVirtual
                    ? 'bg-[#7c3aed] hover:bg-[#732ee4] text-[#ede0ff]'
                    : 'bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isPorqueSi ? '¡Lo Quiero!' : 'Añadir al Carrito'}</span>
              </button>

              {isPhysical && (
                <a
                  href={`https://wa.me/51921617882?text=${encodeURIComponent(`¡Hola! Quiero pedir el siguiente producto:\n📦 ${product.name}\n🏷️ Código: ${product.code}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sfx.playChime()}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-display text-xs font-bold pixel-btn flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLLAPSIBLE COMMENTS DRAWER ("BANDEJA DE COMENTARIOS")                    */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setIsCommentsOpen(!isCommentsOpen);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#272a32] hover:bg-[#32353d] text-white text-xs font-display font-bold transition-all shadow-md border border-white/5"
            >
              <MessageSquare className="w-4 h-4 text-[#d2bbff]" />
              <span>
                {isCommentsOpen ? 'Ocultar bandeja de comentarios' : 'Ver bandeja de comentarios'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#7c3aed]/40 text-[#ede0ff] text-[11px] font-mono">
                {comments.length}
              </span>
              {isCommentsOpen ? (
                <ChevronUp className="w-4 h-4 text-[#958da1]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#958da1]" />
              )}
            </button>

            <span className="text-xs text-[#958da1] hidden sm:inline">
              Opiniones verificadas de clientes
            </span>
          </div>

          {/* DRAWER CONTENT */}
          {isCommentsOpen && (
            <div className="flex flex-col gap-6 p-4 sm:p-5 rounded-2xl bg-[#10131a]/95 border border-white/10 animate-fadeIn">
              {/* Form to Add Comment */}
              <form onSubmit={handleAddComment} className="flex flex-col gap-3 p-4 rounded-xl bg-[#191b23] border border-white/5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ffb2b7]" /> Deja tu comentario y valoración
                  </h4>

                  {/* Comment Rating selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#958da1]">Tu puntuación:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= commentRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo..."
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-[#7c3aed] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Cuéntanos qué te pareció este producto, la calidad o tu experiencia..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-[#10131a] text-xs text-white px-3 py-2 rounded-xl border border-white/10 focus:border-[#7c3aed] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {commentSuccess ? (
                    <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                      {commentSuccess}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#958da1]">
                      Tu opinión ayuda a otros compradores.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold font-display flex items-center gap-1.5 transition-all shadow-md ml-auto"
                  >
                    <Send className="w-3 h-3" /> Publicar comentario
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="flex flex-col gap-3">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#958da1] border border-dashed border-white/10 rounded-xl">
                    <p className="font-semibold text-[#ccc3d8]">Aún no hay comentarios para este producto.</p>
                    <p className="text-[11px] mt-1">¡Sé el primero en compartir tu experiencia y dejar tus estrellas!</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#191b23]/80 border border-white/5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] flex items-center justify-center font-bold text-xs border border-[#7c3aed]/30">
                            {c.userName ? c.userName[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">
                              {c.userName}
                            </span>
                            <span className="text-[10px] text-[#958da1]">{c.createdAt}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= c.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[#ccc3d8] leading-relaxed pl-9">
                        {c.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
