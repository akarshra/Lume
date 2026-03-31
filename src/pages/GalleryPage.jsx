import Gallery from '../components/Gallery';

const GalleryPage = () => {
  return (
    <div className="page-enter-active" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="container text-center" style={{ padding: '60px 24px 20px' }}>
        <h1 className="title-primary reveal-up">The Collection</h1>
        <p className="subtitle reveal-up" style={{ animationDelay: '0.2s' }}>Explore our handcrafted ribbon masterpieces.</p>
      </div>
      <Gallery />
    </div>
  );
};

export default GalleryPage;
