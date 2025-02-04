import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listCategories } from '../Actions/categoryActions';
import { detailsUser, updateProductDrafts } from '../Actions/userActions';
import { move } from 'move-position';
import MessageBox from '../Components/MessageBox';
import {
  addErrorToImageList,
  desktopScreenCondition,
  formatNumber,
} from '../Utils/Utilities';
import LoadingCircle from '../Components/LoadingCircle';

const NewProductScreen = (props) => {
  const urlParams = new URLSearchParams(props.location.search);
  const categoryList = useSelector((state) => state.categoryList);
  const { loading, error, categories } = categoryList;
  const userLogin = useSelector((state) => state.userLogin);
  const { user } = userLogin;
  const userDetails = useSelector((state) => state.userDetails);
  const {
    error: detailsError,
    user: details,
    loading: loadingDetails,
  } = userDetails;
  const userUpdateProductDrafts = useSelector(
    (state) => state.userUpdateProductDrafts
  );
  const {
    loading: updateLoading,
    error: updateError,
    user: userUpdated,
  } = userUpdateProductDrafts;
  const draftId = urlParams.get('draft');
  const [cacheValues, setCacheValues] = useState(null);
  const [searchSell, setSearchSell] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isStateNew, setIsStateNew] = useState(null);
  const [images, setImages] = useState([]);
  const [percentage, setPercentage] = useState(-1);
  const [quantity, setQuantity] = useState(
    cacheValues ? cacheValues.stock : ''
  );
  const [searchError, setSearchError] = useState(false);
  const [imageError, setImageError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [showHelpSign, setShowHelpSign] = useState(false);
  const [showChangeCategorySign, setShowChangeCategorySign] = useState(false);
  const wrapperRef = useRef(null);
  const wrapperRefHelpSign = useRef(null);
  const wrapperRefCategorySign = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      const { current: wrap } = wrapperRef;
      if (wrap && !wrap.contains(event.target)) {
        document.querySelector('.searchbar-sell').classList.remove('focused');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleClickOutsideHelpSign = (event) => {
      const { current: wrapSign } = wrapperRefHelpSign;
      if (wrapSign && !wrapSign.contains(event.target)) {
        document.querySelector('#help-sign').classList.add('hidden');
        setTimeout(() => {
          setShowHelpSign(false);
        }, 500);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideHelpSign);
    const handleClickOutsideCategorySign = (event) => {
      const { current: wrapSign } = wrapperRefCategorySign;
      if (wrapSign && !wrapSign.contains(event.target)) {
        document.querySelector('#change-category-cancelbtn').click();
      }
    };
    document.addEventListener('mousedown', handleClickOutsideCategorySign);

    const handleScroll = () => {
      if (window.scrollY >= 160) {
        if (document.querySelector('.new-product-steps'))
          document.querySelector('.new-product-steps').style.transform =
            'translateY(5.5rem)';
      } else {
        if (document.querySelector('.new-product-steps'))
          document.querySelector('.new-product-steps').style.transform =
            'translateY(0)';
      }
    };
    document.addEventListener('scroll', handleScroll);
    const preventDragAndDrop = (e) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDragAndDrop, false);
    window.addEventListener('drop', preventDragAndDrop, false);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideCategorySign);
      document.removeEventListener('mousedown', handleClickOutsideHelpSign);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('drop', preventDragAndDrop);
      window.removeEventListener('dragover', preventDragAndDrop);
    };
  }, []);
  useEffect(() => {
    user && dispatch(detailsUser(user._id));
  }, [user, dispatch]);

  useEffect(() => {
    details && draftId === null && setCacheValues('');
  }, [details, draftId]);
  useEffect(() => {
    if (
      draftId === null &&
      percentage === 33 &&
      userUpdated &&
      userUpdated.productDrafts &&
      !updateLoading
    ) {
      props.history.push(
        '/vender/producto?draft=' +
          userUpdated.productDrafts[userUpdated.productDrafts.length - 1]._id
      );
    } else if (details) {
      details.productDrafts.find((draft) => draft._id === draftId) &&
        setCacheValues(
          details.productDrafts.find((draft) => draft._id === draftId)
        );
    }
  }, [updateLoading, draftId, percentage, userUpdated, details, props]);
  useEffect(() => {
    setSearchSell(cacheValues ? cacheValues.name : '');
    setSelectedCategory(cacheValues ? cacheValues.category : null);
    setIsStateNew(cacheValues ? cacheValues.isStateNew : null);
    setImages(cacheValues ? cacheValues.images : []);
    setPercentage(
      cacheValues
        ? cacheValues.name
          ? cacheValues.category
            ? cacheValues.isStateNew !== null
              ? cacheValues.images && cacheValues.images.length > 0
                ? 100
                : 67
              : 33
            : 16.5
          : 0
        : cacheValues === ''
        ? 0
        : -1
    );
    setQuantity(cacheValues ? cacheValues.stock : '');
  }, [cacheValues]);

  useEffect(() => {
    switch (percentage) {
      case 0:
        document.querySelector('#first-step') &&
          document.querySelector('#first-step').scrollIntoView();
        break;
      case 16.5:
        document.querySelector('#first-step') &&
          document.querySelector('#first-step').scrollIntoView();
        break;
      case 33:
        if (!updateLoading && !updateError) {
          document.querySelector('#second-step') &&
            document.querySelector('#second-step').scrollIntoView();
        }
        break;
      case 67:
        !updateLoading &&
          !updateError &&
          document.querySelector('#third-step') &&
          document.querySelector('#third-step').scrollIntoView();
        setImageError('');
        setQuantityError('');
        break;
      case 100:
        !updateLoading &&
          !updateError &&
          window.scrollTo(0, document.body.scrollHeight);
        break;
      default:
        break;
    }
  }, [percentage, updateLoading, updateError]);

  useEffect(() => {
    showHelpSign &&
      document.querySelector('#help-sign').classList.remove('hidden');
    showHelpSign
      ? (document.querySelector('body').style.overflow = 'hidden')
      : (document.querySelector('body').style.overflow = 'auto');
  }, [showHelpSign]);

  useEffect(() => {
    showChangeCategorySign &&
      document
        .querySelector('#change-category-sign')
        .classList.remove('hidden');
    showChangeCategorySign
      ? (document.querySelector('body').style.overflow = 'hidden')
      : (document.querySelector('body').style.overflow = 'auto');
  }, [showChangeCategorySign]);

  useEffect(() => {
    percentage >= 16.5 &&
      categories &&
      categories.length < 1 &&
      dispatch(listCategories());
  }, [dispatch, percentage, categories]);

  const CheckDimension = (file) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      var image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        var height = this.height;
        var width = this.width;
        if (height < 500 || width < 500) {
          addErrorToImageList(
            reader.result,
            '- El tamaño es menor a 500 x 500 px.',
            setImageError
          );
        } else {
          setPercentage(67);
          setImages((images) => [...images, this.src]);
        }
      };
    };
  };
  const firstStepHeader = () => (
    <div className='screen-mini-card-header'>
      {' '}
      <a
        className='sell-back-to-search-btn'
        href='#back'
        onClick={(e) => {
          e.preventDefault();
          setPercentage(0);
          setSelectedCategory(null);
        }}
      >
        Volver a buscar
      </a>
    </div>
  );

  const firstStepSearch = () => (
    <>
      <div className='row margin-bottom width-100'>
        <div className='searchbar-sell'>
          <i className='fa fa-search'></i>
          <input
            autoFocus
            maxLength='120'
            value={searchSell}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                if (searchSell.trim().length > 0) {
                  setSelectedCategory(null);
                  setPercentage(16.5);
                } else {
                  setSearchError(true);
                }
              }
            }}
            onChange={(e) => {
              setSearchSell(e.target.value);
              setSearchError(false);
            }}
            ref={wrapperRef}
            onFocus={() => {
              document
                .querySelector('.searchbar-sell')
                .classList.add('focused');
            }}
            type='text'
            placeholder='Ej.: Celular Samsung Galaxy S9 64 GB Negro o 887276246529'
          ></input>
          <i
            className='fas fa-times gray'
            onClick={() => setSearchSell('')}
          ></i>
        </div>
        <div
          className={
            'search-sell-subtext subtle-text' + (searchError ? ' error' : '')
          }
        >
          {desktopScreenCondition &&
            (!searchError
              ? 'Sumá las características principales del producto para mejorar la búsqueda.'
              : 'Para comenzar, indicá el producto que querés publicar.')}
        </div>
        <button
          className={
            'primary' +
            (desktopScreenCondition ? ' margin-left' : ' margin-top block')
          }
          onClick={() => {
            if (searchSell.trim().length > 0) {
              setSelectedCategory(null);
              setPercentage(16.5);
            } else {
              setSearchError(true);
            }
          }}
        >
          Comenzar
        </button>
      </div>
    </>
  );
  const firstStepSelectCategory = () => (
    <>
      {selectedCategory === null && percentage >= 16.5 && (
        <div className='sell-categories-list-container'>
          <ul className='sell-categories-list'>
            {categories.map((category) => {
              return (
                <li key={category._id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category._id);
                    }}
                  >
                    {category.name}
                    <i className='fas fa-angle-right absolute-right'></i>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {selectedCategory !== null &&
        (categories &&
        categories.find((category) => category._id === selectedCategory) ? (
          <div className='column' style={{ gap: '2rem' }}>
            {' '}
            <span className='selected-category-sell'>
              <img
                src={
                  categories.find(
                    (category) => category._id === selectedCategory
                  ).svg
                }
                onLoad={() => {
                  document.querySelector(
                    '#selected-category-name'
                  ).style.display = 'flex';
                }}
                alt={
                  categories.find(
                    (category) => category._id === selectedCategory
                  ).name + 'logo'
                }
              ></img>
              <span
                className='column margin-left'
                id='selected-category-name'
                hidden
              >
                <span>
                  {
                    categories.find(
                      (category) => category._id === selectedCategory
                    ).name
                  }
                </span>
                {percentage >= 33 && (
                  <a
                    href='#cambiar-categoria'
                    onClick={() => {
                      setSelectedCategory(null);
                    }}
                  >
                    Elegir otra
                  </a>
                )}
              </span>
            </span>
            {percentage <= 33 && (
              <span
                style={{
                  fontSize: desktopScreenCondition ? 'initial' : '1.4rem',
                }}
              >
                Es muy importante que la categoría sea la apropiada para que tus
                compradores encuentren tu producto. Si no lo es, podríamos
                pedirte que vuelvas a publicar.
              </span>
            )}
          </div>
        ) : (
          <div className='screen-mini-card medium'>
            <MessageBox variant='danger'>
              Se ha producido un error, por favor vuelva a empezar
            </MessageBox>
          </div>
        ))}
    </>
  );
  const firstStepFooter = () => (
    <div className='screen-mini-card-footer flex-end'>
      <button
        className='primary'
        onClick={() => {
          if (
            !cacheValues ||
            cacheValues.category === null ||
            cacheValues.category === selectedCategory
          ) {
            setCacheValues({
              name: searchSell,
              category: selectedCategory,
              images: [],
              isStateNew: null,
            });
            dispatch(
              updateProductDrafts({
                name: searchSell,
                category: selectedCategory,
                _id: draftId ? draftId : null,
                isStateNew: null,
                images: [],
              })
            );
          } else {
            setShowChangeCategorySign(true);
          }
        }}
      >
        Confirmar
      </button>
    </div>
  );

  const secondStep = (status) => (
    <div
      id='second-step'
      className={
        'screen-mini-card medium' + (status === 'disabled' ? ' disabled' : '')
      }
    >
      <div className='screen-mini-card-header-title'>
        <h2>¿Cuál es la condición de tu producto?</h2>
      </div>
      <ul>
        <li
          className={
            'sell-stateBtn-nuevo multiple-selection-btn' +
            (isStateNew === true ? ' selected' : '')
          }
        >
          <button
            className='list-item padding'
            onClick={() => {
              if (isStateNew !== true) {
                setIsStateNew(true);
                dispatch(
                  updateProductDrafts({
                    ...cacheValues,
                    isStateNew: true,
                    _id: draftId ? draftId : null,
                  })
                );
              }
            }}
          >
            Nuevo
          </button>
        </li>
        <li
          className={
            'sell-stateBtn-usado multiple-selection-btn' +
            (isStateNew === false ? ' selected' : '')
          }
        >
          <button
            className='list-item padding'
            onClick={() => {
              if (isStateNew !== false) {
                setIsStateNew(false);
                dispatch(
                  updateProductDrafts({
                    ...cacheValues,
                    name: searchSell,
                    category: selectedCategory,
                    isStateNew: false,
                    images,
                    _id: draftId ? draftId : null,
                  })
                );
              }
            }}
          >
            Usado
          </button>
        </li>
      </ul>
    </div>
  );

  const thirdStep = (status) => (
    <div
      id='third-step'
      className={
        'screen-mini-card medium' + (status === 'disabled' ? ' disabled' : '')
      }
    >
      <div className='screen-mini-card-header-title'>
        <h2>Completá la información de tu producto</h2>
        {desktopScreenCondition && (
          <button
            className='hover-btn absolute-right'
            onClick={() => {
              setShowHelpSign(true);
            }}
          >
            <img
              className='smaller'
              src='https://svgshare.com/i/UKg.svg'
              alt='Ayuda'
            ></img>
          </button>
        )}
      </div>
      <div className='screen-mini-card-body padding column'>
        <div className='message-div blue row'>
          <p className='paragraph-with-icon bold'>
            <img
              src='https://svgshare.com/i/UNm.svg'
              alt='tip'
              className='absolute-left-top circle badge'
            />
            Para no perder exposición, asegúrate de que la primera foto tenga
            fondo blanco puro creado con un editor de imágenes. No agregues
            bordes, logos ni marcas de agua.
            <a href='#masconsejos'>Ver más consejos.</a>
          </p>
        </div>

        <div
          className={'message-div red row' + (!imageError ? ' no-display' : '')}
        >
          <div className='width-100 relative'>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/UQW.svg'
                alt='tip'
                className='absolute-left-top circle badge'
              />
              {imageError}
            </p>
          </div>
          <div className='message-div-content'>
            <ul id='error-list' className='width-100'></ul>
          </div>
        </div>

        <div
          className={
            'image-upload-images-container' +
            (images.length > 0 ? ' with-scroll' : '')
          }
        >
          <ul
            className={
              'image-slider row flex-start' +
              (images.length > 0 ? ' fit-content' : '')
            }
          >
            <div
              className={
                'upload-image-div center column' +
                (images.length > 0 ? ' in-slider' : '')
              }
              role='button'
              onClick={() => {
                document.querySelector('#inputfile').click();
              }}
              onDragEnter={(e) => {
                document
                  .querySelector('.upload-image-div')
                  .classList.add('on-drag');
              }}
              onDragLeave={(e) => {
                document
                  .querySelector('.upload-image-div')
                  .classList.remove('on-drag');
              }}
              onDrop={(e) => {
                document
                  .querySelector('.upload-image-div')
                  .classList.remove('on-drag');
                if (e.dataTransfer.files.length + images.length <= 8) {
                  document.querySelector('#error-list').innerHTML = '';
                  for (var i = 0; i < e.dataTransfer.files.length; i++) {
                    if (e.dataTransfer.files[i].size / 1000000 <= 5) {
                      const dataType = e.dataTransfer.files[i].type;
                      if (
                        dataType.includes('image/jpeg') ||
                        dataType.includes('image/png')
                      ) {
                        CheckDimension(e.dataTransfer.files[i]);
                      } else {
                        addErrorToImageList(
                          'https://svgshare.com/i/UYj.svg',
                          '- El formato no es JPG o PNG.',
                          setImageError
                        );
                      }
                    } else {
                      addErrorToImageList(
                        'https://svgshare.com/i/UYj.svg',
                        '- El archivo pesa mas de 5mb',
                        setImageError
                      );
                    }
                  }
                  if (document.querySelector('#error-list').innerHTML === '')
                    setImageError('');
                } else {
                  document.querySelector('.message-div.red') &&
                    document
                      .querySelector('.message-div.red')
                      .classList.remove('height-auto');
                  document.querySelector('#error-list').innerHTML = '';
                  setImageError('Puedes subir como máximo 8 fotos.');
                }
              }}
            >
              <img src='https://svgshare.com/i/UPJ.svg' alt='camara' />
              <span
                className={
                  images.length > 0 ? 'small-text bold' : 'subtle-text'
                }
              >
                Agrega {desktopScreenCondition ? 'o arrastra ' : ''}tus
                <br /> fotos aquí
              </span>
              <input
                style={{ display: 'none' }}
                id='inputfile'
                type='file'
                accept='image/x-png,image/jpeg,image/jpg'
                onChange={(e) => {
                  if (e.target.files.length + images.length <= 8) {
                    document.querySelector('#error-list').innerHTML = '';
                    for (var i = 0; i < e.target.files.length; i++) {
                      if (e.target.files[i].size / 1000000 <= 5) {
                        const dataType = e.target.files[i].type;
                        if (
                          dataType.includes('image/jpeg') ||
                          dataType.includes('image/png')
                        ) {
                          CheckDimension(e.target.files[i]);
                        } else {
                          addErrorToImageList(
                            'https://svgshare.com/i/UYj.svg',
                            '- El formato no es JPG o PNG.',
                            setImageError
                          );
                        }
                      } else {
                        addErrorToImageList(
                          'https://svgshare.com/i/UYj.svg',
                          '- El archivo pesa mas de 5mb',
                          setImageError
                        );
                      }
                    }
                    if (document.querySelector('#error-list').innerHTML === '')
                      setImageError('');
                  } else {
                    document.querySelector('.message-div.red') &&
                      document
                        .querySelector('.message-div.red')
                        .classList.remove('height-auto');
                    document.querySelector('#error-list').innerHTML = '';
                    setImageError('Puedes subir como máximo 8 fotos.');
                  }
                  e.target.value = '';
                }}
                multiple
              ></input>
            </div>
            {images &&
              images.length > 0 &&
              images.map((image, i) => {
                return (
                  <li className='image-slider-item' key={i}>
                    <img className='center-cropped' src={image} alt='Subida' />
                    {i === 0 && (
                      <div className='absolute-bottom width-100 cover-page'>
                        <h3>Portada</h3>
                      </div>
                    )}
                    <div className='image-slider-item-options'>
                      <button
                        className='image-slider-arrow-btn'
                        onClick={() => {
                          if (images.length > 1 && i !== 0) {
                            setImages(move(images, i, i - 1, false));
                            setPercentage(67);
                          }
                        }}
                      >
                        <i className='fas fa-caret-left'></i>
                      </button>
                      <button
                        className='image-slider-del-btn'
                        onClick={() => {
                          setImages((images) => [
                            ...images.slice(0, i),
                            ...images.slice(i + 1),
                          ]);
                          setPercentage(67);
                        }}
                      >
                        <img
                          src='https://svgshare.com/i/Ucx.svg'
                          alt='boton borrar'
                        ></img>
                      </button>
                      <button
                        className='image-slider-arrow-btn'
                        onClick={() => {
                          if (images.length > 1 && images.length - 1 !== i) {
                            setImages(move(images, i, i + 1, false));
                            setPercentage(67);
                          }
                        }}
                      >
                        <i className='fas fa-caret-right'></i>
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className='wrapper sell'>
          <div className='underline-label-input'>
            <input
              type='text'
              maxLength='5'
              className={quantityError ? 'error' : ''}
              value={quantity > 0 ? formatNumber(quantity) : ''}
              onChange={(e) => {
                setQuantity(e.target.value.split('.').join(''));
                if (e.target.value.length === 0 || e.target.value === '0') {
                  setQuantityError('La cantidad mínima es 1.');
                } else {
                  setQuantityError('');
                }
              }}
              onKeyDown={(e) => {
                if (
                  !(
                    (e.keyCode >= 48 && e.keyCode <= 57) ||
                    e.keyCode === 8 ||
                    e.keyCode === 37 ||
                    e.keyCode === 39 ||
                    e.keyCode === 46
                  )
                )
                  e.preventDefault();
                setPercentage(67);
              }}
            ></input>
            <div
              className={'underline' + (quantityError ? ' error' : '')}
            ></div>
            <label>Cantidad</label>
            <span
              className={
                'subtle-text' + (quantityError ? ' error' : ' noerror')
              }
            >
              {quantityError && quantityError}
            </span>
          </div>
        </div>
      </div>
      {percentage < 100 && (
        <div className='screen-mini-card-footer flex-end'>
          <div
            className={
              'width-100' +
              (desktopScreenCondition ? ' row' : ' column reverse')
            }
          >
            <button
              className={
                'secondary' + (!desktopScreenCondition ? ' block' : '')
              }
              onClick={() => setImages([])}
            >
              Cancelar
            </button>
            <button
              className={
                'primary' +
                (!desktopScreenCondition ? ' block margin-bottom' : '')
              }
              onClick={() => {
                if (images.length > 0) {
                  if (quantity !== '' && parseInt(quantity) > 0) {
                    dispatch(
                      updateProductDrafts({
                        ...cacheValues,
                        images,
                        stock: parseInt(quantity),
                        _id: draftId ? draftId : null,
                      })
                    );
                  } else {
                    setQuantityError('La cantidad mínima es 1.');
                  }
                } else {
                  setImageError('Agregá al menos una foto.');
                  if (quantity === '' || parseInt(quantity) === 0) {
                    setQuantityError('La cantidad mínima es 1.');
                  }
                }
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const helpSign = () => (
    <div id='help-sign' className='modal-bg hidden center'>
      <div className='screen-mini-card medium' ref={wrapperRefHelpSign}>
        <div className='screen-mini-card-header-title'>
          <h1>Sacá las mejores fotos para no perder exposición</h1>
          <i
            className='fas fa-times absolute-right less-right blue'
            onClick={() => {
              document.querySelector('#help-sign').classList.add('hidden');
              setTimeout(() => {
                setShowHelpSign(false);
              }, 500);
            }}
          ></i>
        </div>
        <div className='screen-mini-card-body padding'>
          <div className='half-body'>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/ULR.svg'
                className='very-small absolute-left-top'
                alt='check'
              />
              Utilizá un editor de imágenes para crear un fondo blanco puro para
              tu producto. No publiques fotos de tu producto frente una pared u
              otro elemento.
            </p>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/ULR.svg'
                className='very-small absolute-left-top'
                alt='check'
              />
              No le agregues bordes, logos, marcas de agua, banners ni textos
              promocionales.
            </p>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/ULR.svg'
                className='very-small absolute-left-top'
                alt='check'
              />
              ¡Sacá fotos grandes! Como mínimo deben tener 500 píxeles en uno de
              sus lados. Te recomendamos 1200 x 1200, para que puedan hacer
              zoom.
            </p>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/ULR.svg'
                className='very-small absolute-left-top'
                alt='check'
              />
              Mostrá tu producto desde diferentes ángulos.
            </p>
            <p className='paragraph-with-icon bold'>
              <img
                src='https://svgshare.com/i/ULR.svg'
                className='very-small absolute-left-top'
                alt='check'
              />
              Si necesitás mostrar cómo se ve tu producto en contexto, hacelo a
              partir de tu segunda imagen.
            </p>
          </div>
          <div className='half-body center'>
            <img
              className='medium'
              src='https://svgshare.com/i/UN4.svg'
              alt='Shoes'
            />
          </div>
        </div>
      </div>
    </div>
  );

  const changeCategorySign = () => (
    <div id='change-category-sign' className='modal-bg hidden center'>
      <div className='screen-mini-card small' ref={wrapperRefCategorySign}>
        <div className='screen-mini-card-header-title'>
          <h1>
            Con este cambio, perderás todos los datos que ya habías completado
          </h1>
          <i
            className='fas fa-times absolute-right less-right blue'
            onClick={() => {
              document.querySelector('#change-category-cancelbtn').click();
            }}
          ></i>
        </div>
        <div className='screen-mini-card-body padding column'>
          <span className='subtle-text margin-bottom'>
            Como estás modificando informacion que elegiste, tendrás que volver
            a seleccionarla.
          </span>
          <div className='row flex-start'>
            <button
              className='primary'
              onClick={() => {
                setIsStateNew(null);
                setImages([]);
                setQuantity(0);
                dispatch(
                  updateProductDrafts({
                    name: searchSell,
                    category: selectedCategory,
                    _id: draftId ? draftId : null,
                  })
                );
                document
                  .querySelector('#change-category-sign')
                  .classList.add('hidden');
                setTimeout(() => {
                  setShowChangeCategorySign(false);
                }, 500);
              }}
            >
              Aceptar
            </button>
            <button
              id='change-category-cancelbtn'
              className='secondary margin-left'
              onClick={() => {
                setSelectedCategory(cacheValues.category);
                dispatch(
                  updateProductDrafts({
                    ...cacheValues,
                    name: searchSell,
                    _id: draftId ? draftId : null,
                  })
                );
                document
                  .querySelector('#change-category-sign')
                  .classList.add('hidden');
                setTimeout(() => {
                  setShowChangeCategorySign(false);
                }, 500);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {detailsError || error ? (
        <div className='screen-mini-card medium'>
          <MessageBox variant='danger'>{detailsError || error}</MessageBox>
        </div>
      ) : (
        <>
          {desktopScreenCondition && (
            <div className='extra-header new-product'></div>
          )}
          <div className='new-product-steps'>
            <span>
              <span className='step-number'>1</span>
              Datos del producto
            </span>
            <div
              className='progress-bar'
              style={{ width: percentage + '%' }}
            ></div>
          </div>
          <div className='flex-center width-100'>
            <div className='column flex-start'>
              {percentage < 0 ? (
                <LoadingCircle color='blue' />
              ) : (
                <>
                  <div
                    className='row width-100'
                    style={{
                      zIndex: '100',
                      marginBottom: desktopScreenCondition && '6rem',
                    }}
                  >
                    <div>
                      <h4 className='subtle-text'>Paso 1 de 2</h4>
                      <h1 style={{ fontSize: '2.5rem' }}>
                        Empecemos identificando tu producto
                      </h1>
                    </div>
                    {desktopScreenCondition && (
                      <img
                        src='https://http2.mlstatic.com/secure/sell/images/shoe-v2.svg'
                        alt='arte de zapato'
                      ></img>
                    )}
                  </div>

                  <div
                    id='first-step'
                    className={
                      'screen-mini-card medium' +
                      (percentage > 16.5 && updateLoading ? ' disabled' : '')
                    }
                  >
                    {percentage >= 16.5 && firstStepHeader()}
                    <div className='screen-mini-card-body padding column'>
                      {percentage < 16.5 ? (
                        <h2>
                          Indicá producto, marca, modelo y características
                          principales
                        </h2>
                      ) : selectedCategory === null ? (
                        <h2>¿Qué opción lo describe?</h2>
                      ) : percentage < 33 ? (
                        <h2>Confirma la categoría</h2>
                      ) : (
                        <h2>La categoría que elegiste</h2>
                      )}
                      {percentage < 16.5 && firstStepSearch()}
                      {loading ? (
                        <></>
                      ) : error ? (
                        <div className='screen-mini-card medium'>
                          <MessageBox variant='danger'>{error}</MessageBox>
                        </div>
                      ) : (
                        firstStepSelectCategory()
                      )}
                    </div>
                    {selectedCategory !== null &&
                      !loading &&
                      percentage === 16.5 &&
                      firstStepFooter()}
                  </div>
                </>
              )}
              {percentage === 33 ? (
                updateError ? (
                  <div className='screen-mini-card medium'>
                    <MessageBox variant='danger'>{updateError}</MessageBox>
                  </div>
                ) : updateLoading || loadingDetails || draftId === null ? (
                  secondStep('disabled')
                ) : (
                  secondStep()
                )
              ) : (
                percentage > 33 &&
                (updateLoading || loadingDetails || draftId === null
                  ? secondStep('disabled')
                  : secondStep())
              )}
              {percentage >= 67 &&
                (updateLoading || loadingDetails || draftId === null ? (
                  thirdStep('disabled')
                ) : updateError ? (
                  <div className='screen-mini-card medium'>
                    <MessageBox variant='danger'>{updateError}</MessageBox>
                  </div>
                ) : (
                  thirdStep()
                ))}
              {percentage === 100 && (
                <div className='row flex-end width-100'>
                  <button
                    className={
                      'primary' +
                      (!desktopScreenCondition
                        ? ' block margin-left margin-right'
                        : '')
                    }
                    disabled={updateLoading || loadingDetails || updateError}
                    onClick={() => {
                      document.querySelector('#siguiente-link').click();
                    }}
                  >
                    Siguiente
                  </button>
                  <a
                    id='siguiente-link'
                    href={'/publicar?draft=' + draftId}
                    hidden
                  >
                    Siguiente
                  </a>
                </div>
              )}
            </div>
          </div>
          {showHelpSign && helpSign()}
          {showChangeCategorySign && changeCategorySign()}
        </>
      )}
    </>
  );
};

export default NewProductScreen;
