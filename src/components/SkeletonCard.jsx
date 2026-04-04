import "./SkeletonCard.css";
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img skel" />
    <div className="skeleton-body">
      <div className="skel skel-tag" />
      <div className="skel skel-title" />
      <div className="skel skel-text" />
      <div className="skel skel-text short" />
      <div className="skeleton-footer">
        <div className="skel skel-price" />
        <div className="skel skel-btn" />
      </div>
    </div>
  </div>
);
export default SkeletonCard;
