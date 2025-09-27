import React, {useState, useEffect} from 'react';
import bannerApi from '../settings/api/bannerApi';

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load active banners
    const loadBanners = async () => {
        try {
            setLoading(true);
            const activeBanners = await bannerApi.getActiveBanners();
            setBanners(activeBanners);

            // If no banners, use default banner
            if(activeBanners.length === 0) {
                setBanners([{
                    id: 'default',
                    name: 'Default Banner',
                    banner_url: '/images/banners/1.jpg'
                }]);
            }
        } catch(error) {
            console.error('BannerSlider: Error loading banners:', error);
            setError('Failed to load banners');
            // Fallback to default banner
            setBanners([{
                id: 'default',
                name: 'Default Banner',
                banner_url: '/images/banners/1.jpg'
            }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    // Auto slide functionality
    useEffect(() => {
        if(banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                prevSlide === banners.length - 1 ? 0 : prevSlide + 1
            );
        }, 3000); // Change slide every 3 seconds for better experience

        return () => clearInterval(interval);
    }, [banners.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
    };

    const goToNext = () => {
        setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
    };

    if(loading) {
        return (
            <section className="section-intro padding-y-sm">
                <div className="container">
                    <div className="intro-banner-wrap">
                        <div className="text-center py-5">
                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                            <p className="mt-2">Loading banners...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if(error) {
        return (
            <section className="section-intro padding-y-sm">
                <div className="container">
                    <div className="intro-banner-wrap">
                        <div className="alert alert-warning text-center">
                            <i className="fa fa-exclamation-triangle mr-2"></i>
                            {error}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section-intro padding-y-sm">
            <div className="container">
                <div className="intro-banner-wrap position-relative">
                    {/* Banner Slider */}
                    <div
                        id="bannerCarousel"
                        className="carousel slide"
                        data-ride="carousel"
                        style={{height: '400px'}}
                    >
                        {/* Carousel Indicators */}
                        {banners.length > 1 && (
                            <ol className="carousel-indicators">
                                {banners.map((_, index) => (
                                    <li
                                        key={index}
                                        className={index === currentSlide ? 'active' : ''}
                                        onClick={() => goToSlide(index)}
                                        style={{cursor: 'pointer'}}
                                    ></li>
                                ))}
                            </ol>
                        )}

                        {/* Carousel Inner */}
                        <div className="carousel-inner h-100">
                            {banners.map((banner, index) => (
                                <div
                                    key={banner.id}
                                    className={`carousel-item h-100 ${index === currentSlide ? 'active' : ''}`}
                                >
                                    <img
                                        src={banner.banner_url}
                                        className="d-block w-100 h-100"
                                        alt={banner.name}
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                        onError={(e) => {
                                            console.error('Banner image failed to load:', banner.banner_url);
                                            e.target.src = '/images/banners/1.jpg'; // Fallback
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>

            <style jsx>{`
                .carousel-item {
                    transition: transform 0.6s ease-in-out;
                }
                
                .carousel-control-prev,
                .carousel-control-next {
                    width: 5%;
                }
                
                .carousel-control-prev-icon,
                .carousel-control-next-icon {
                    background-color: rgba(0, 0, 0, 0.5);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                }
                
                .carousel-indicators li {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.5);
                    border: none;
                }
                
                .carousel-indicators li.active {
                    background-color: #007bff;
                }
            `}</style>
        </section>
    );
};

export default BannerSlider;
