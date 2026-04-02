import './RibbonRose3D.css';

const RibbonRose3D = () => {
  const outer = [0,45,90,135,180,225,270,315];
  const mid   = [22,82,142,202,262,322];
  const inner = [10,100,190,280];
  const sparks = [
    {top:'18%',left:'15%',delay:'0s',dur:'2.8s'},
    {top:'10%',left:'55%',delay:'1s',dur:'3.2s'},
    {top:'25%',left:'80%',delay:'0.5s',dur:'2.5s'},
    {top:'65%',left:'10%',delay:'1.8s',dur:'3s'},
    {top:'70%',left:'75%',delay:'0.3s',dur:'2.7s'},
    {top:'45%',left:'88%',delay:'2s',dur:'3.5s'},
  ];
  const rings = [{s:'160px',delay:'0s'},{s:'220px',delay:'1.3s'},{s:'280px',delay:'2.6s'}];

  return (
    <div className='rr-scene'>
      {rings.map((r,i) => (
        <div key={i} className='rr-ring' style={{width:r.s,height:r.s,animationDelay:r.delay}} />
      ))}
      <div className='rr-flower'>
        {outer.map(deg => (
          <div key={'o'+deg} className='rr-petal rr-outer'
            style={{transform:'rotateY('+deg+'deg) rotateX(58deg) translateZ(68px)'}} />
        ))}
        {mid.map(deg => (
          <div key={'m'+deg} className='rr-petal rr-mid'
            style={{transform:'rotateY('+deg+'deg) rotateX(42deg) translateZ(44px)'}} />
        ))}
        {inner.map(deg => (
          <div key={'i'+deg} className='rr-petal rr-inner'
            style={{transform:'rotateY('+deg+'deg) rotateX(24deg) translateZ(22px)'}} />
        ))}
        <div className='rr-bud' />
      </div>
      <div className='rr-glow' />
      {sparks.map((s,i) => (
        <div key={i} className='rr-sparkle'
          style={{top:s.top,left:s.left,animationDelay:s.delay,animationDuration:s.dur}} />
      ))}
    </div>
  );
};

export default RibbonRose3D;