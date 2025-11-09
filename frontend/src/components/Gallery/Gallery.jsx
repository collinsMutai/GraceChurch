import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import "./Gallery.css";

import image1 from "../../images/img1.jpeg";
import image2 from "../../images/img2.jpeg";
import image3 from "../../images/img3.jpeg";
import image4 from "../../images/img4.jpeg";
import image5 from "../../images/img5.jpeg";
import image6 from "../../images/img6.jpeg";
import image7 from "../../images/img7.jpeg";
import image8 from "../../images/img8.jpeg";
import image9 from "../../images/img9.jpeg";
import HeaderImage from "../../images/slider1.jpeg";
import Header from "../Header/Header";

const allImages = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
];

const IMAGES_PER_LOAD = 3;

const Gallery = () => {
  const breadcrumbs = [
    { text: "Home", link: "/" },
    { text: "Gallery", link: "/gallery" },
  ];
  const [images, setImages] = useState(allImages.slice(0, IMAGES_PER_LOAD));
  const [page, setPage] = useState(1);

  const fetchMoreImages = () => {
    const start = page * IMAGES_PER_LOAD;
    const newImages = allImages.slice(start, start + IMAGES_PER_LOAD);

    setImages((prev) => [...prev, ...newImages]);
    setPage((prev) => prev + 1);
  };

  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    768: 1,
  };

  return (
    <>
      <Header
        title="Gallery"
        imageUrl={HeaderImage} // Passing the background image
        breadcrumbs={breadcrumbs} // Passing breadcrumb data
      />

      <InfiniteScroll
        dataLength={images.length}
        next={fetchMoreImages}
        hasMore={images.length < allImages.length} // stops when all images loaded
        loader={<div className="loader">Loading...</div>}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((img, index) => (
            <div className="gallery-item" key={index}>
              <img src={img} alt={`Gallery ${index}`} />
            </div>
          ))}
        </Masonry>
      </InfiniteScroll>
    </>
  );
};

export default Gallery;
