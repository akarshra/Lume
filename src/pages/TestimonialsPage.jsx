import Testimonials from '../components/Testimonials';

const TestimonialsPage = () => {
  return (
    <div className="page-enter-active" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="container text-center" style={{ padding: '60px 24px 20px' }}>
        <h1 className="title-primary reveal-up">Customer Love</h1>
        <p className="subtitle reveal-up" style={{ animationDelay: '0.2s' }}>What our clients are saying about Lumé.</p>
      </div>
      <Testimonials />
    </div>
  );
};

export default TestimonialsPage;
