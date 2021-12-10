window.addEventListener('load', () => {
  document.getElementById('page-top').addEventListener('click', irParaTopoDaPagina);
  document.getElementById('scroll-down').addEventListener('click', irParaConteudoDaPagina);
});

/**
 * Método responsável por enviar o usuário ao começo da página.
 */
function irParaTopoDaPagina() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
}

/**
 * Método responsável por enviar o usuário ao conteúdo da página.
 */
function irParaConteudoDaPagina() {
  const conteudoDaPagina = document.getElementById('content');

  window.scrollTo({
    top: conteudoDaPagina.offsetTop,
    left: 0,
    behavior: "smooth"
  });
}