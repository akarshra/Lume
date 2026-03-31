import Story from '../components/Story';

const About = () => {
  return (
    <div className="page-enter-active" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="container text-center" style={{ padding: '60px 24px 20px' }}>
        <h1 className="title-primary reveal-up">Our Heritage</h1>
        <p className="subtitle reveal-up" style={{ animationDelay: '0.2s' }}>The passion behind every petal.</p>
      </div>
      <Story />
    </div>
  );
};

export default About;
