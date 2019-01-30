widget = {
  onData: function (el, data) {
  var template = _.template($('.template', el).html());

          if (data.title) {
              $('h2', el).text(data.title);
          }

          $('.content', el).html(template(data));
  // Get the modal
  var modal = document.getElementById(data.projectName+'-myModal');

  // Get the main container and the body
  var body = document.getElementsByTagName('body');
  var container = document.getElementById(data.projectName);

  // Get the open button
  var btnOpen = document.getElementById(data.projectName+"-myBtn");

  // Get the close button
  var btnClose = document.getElementById(data.projectName+"-closeModal");

  // Open the modal
  btnOpen.onclick = function() {
      modal.className = "Modal is-visuallyHidden";
      setTimeout(function() {
        container.className = "MainContainer is-blurred";
        modal.className = "Modal";
      }, 100);
      container.parentElement.className = "ModalOpen";
  }

  // Close the modal
  btnClose.onclick = function() {
      modal.className = "Modal is-hidden is-visuallyHidden";
      body.className = "";
      container.className = "MainContainer";
      container.parentElement.className = "";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.className = "Modal is-hidden";
          body.className = "";
          container.className = "MainContainer";
          container.parentElement.className = "";
      }
  }



}
};
