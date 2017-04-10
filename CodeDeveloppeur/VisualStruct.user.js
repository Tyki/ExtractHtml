// ==UserScript==
// @name        VisualStruct
// @namespace   BL
// @include     *
// @version     1
// @grant       none
// @require     http://code.jquery.com/jquery-1.11.0.min.js
// @require     VS_API.js
// @require     VS_Params.js
// @require     VS_Predicates.js
// @require     VS_Plugin.js
// ==/UserScript==
 
/**
 * VisualStruct.user.js
 * @namespace Parametrage
 */
 
// Variables globales
// Permet le calcul des parametres
var countSize = 0;
var color = "black";
var colorChanged = false;
var background = "white";
var backgroundOrigin;
var hideImagesValue = "no";
 
//Annotation qu'une seule fois.
var alreadyRun = false;
 
 
var ErrorSameColor = "Impossible de choisir une couleur de police identique a la couleur de fond";
//Tableau permettant de detecter les blocs semantiques
var NodeArray = new Array();
var root = document.getElementsByTagName('body')[0];
 
//Notre classe qui sera dans un tableau pour faire la liste des noeuds  
function NodeClass() {
this.Name = "",
this.Node = "";  
}
 
$(document).ready(function()
{
 
    backgroundOrigin = $('body').css('background-color');
    $('img').attr('hide', 'no');
    //Mise en place du formulaire
    CreateBar();
    SetupCSS();
    OverlayHandle();
    //Loading des parametres
    LoadParams();
    //Interaction "glisser deposer"
    $('#ter__modify').drags();
});
 
/**
 * Création et collage de la bulle du formulaire en haut de page
 *
 * @author Arlémi Turpault
 * @return void
 * @function CreateBar
 * @memberof Parametrage
 */
 
function CreateBar()
{
    $('body').append('<button id="ter__modify">Double-cliquez <br/>pour ouvrir <br/>le formulaire</button>');
    var e = '<div id="ter__overlay"><div id="ter__form"><div id="ter__Police"><div id="ter__Titre">Police</div><div id="ter__fonts" class="ter__block">Agrandir la police<br/>';
    e += '<button id="ter__downFont" class="BtnTaille">--</button><button id="ter__upFont" class="BtnTaille">++</button></div>';
    e += '<div id="ter__colors" class="ter__block">Choisir la couleur de fond du site<br/>';
    e += '<button id="ter__colorBlue">&nbsp;&nbsp;</button><button id="ter__colorBlack">&nbsp;&nbsp;</button><button id="ter__colorGreen">&nbsp;&nbsp;</button><button id="ter__colorWhite">&nbsp;&nbsp;</button><button id="ter__ColorYellow">&nbsp;&nbsp;</button></div><div id="ter__colorFont" class="ter__block">Choisir la couleur d\'écriture<br />';
    e += '<button id="ter__colorFontBlue">AA</button><button id="ter__colorFontBlack">AA</button><button id="ter__colorFontGreen">AA</button><button id="ter__colorFontWhite">AA</button><button id="ter__ColorFontYellow">AA</button></div><br />';
    e += 'Contraste des couleurs  (63% min conseillé) : <span id="ter__indContrast"></span>';
    e += '</div><div id="ter__interactivite" class="ter__block"><input type="checkbox" name="ter__alt_only" value="HideImg">Afficher le texte alternatif des images</div><br />'
    e += 'Afficher uniquement le bloc : <select id="ter__selectNode">';
    e += '</select><br/>';
    e += '<div id="ter__choice" class="ter__block"><button id="ter__flush" class="BtnTaille">Réinitialiser</button><button id="ter__cancel" class="BtnTaille">Annuler</button><button id="ter__confirm" class="BtnTaille">Confirmer</button></div></div></div>';
    $('body').append(e);
}
 
/**
 * Affichage d'un unique div en cliquant sur la liste des choix possibles
 * @author Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function displayDivOnly(i)
{
        $('body').children().hide();
        //Obligation de laisser ce noeud sans le prefixe 'ter__' sinon aucune modification possible.
        var e = '<div id="displayOnly">' + NodeArray[i].Node.innerHTML;
        $('body').append(e);
 
        //on associe le refresh au bouton annuler pour revneir a la page
        $('body').append('<button id="ter__cancelDisplay" class="BtnTaille">Annuler</button></div>');
        $('button#ter__cancelDisplay').on('click', function()
        {
                refresh();
                $('#ter__modify').show();
        });
        $("button#ter__modify").show();
        indice = i;
}
 
/**
 * Affiche tout la page. Retour au début
 * @author Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function refresh()
{
        location.reload();
}
 
/**
 * Mise en place du css pour chaque objet qu'on utilisera.
 * @author Baptiste Leulliette / Arlémi Turpault
 * @return void
 * @memberof Parametrage
 */
function SetupCSS()
{
    //Il faut absolument filtrer tout les espaces sinon la propriété CSS n'est pas prise en compte.
    $('#ter__modify').css(
    {
            "float": "right",
            "position": "fixed",
            "right": "0",
            "top": "10px",
            "text-align": "center",
            "padding": "10px",
            "width": "125px",
            "height": "125px",
            "background": "#fafafa",
            "box-shadow": "2px 2px 8px #aaa",
            "font": "bold 1em Arial",
            "border-radius": "50%",
            "color": "#000"
    });
 
    $('#ter__form').css(
    {
            "width": "50%",
            "height": "auto",
            "top": "25px",
            "left": "25%",
            "opacity": "1",
            "overflow": "visible",
            "z-index": "8030",
            "padding": "0",
            "margin": "0",
            "border": "0",
            "outline": "none",
            "vertical-align": "top",
            "position": "relative",
            "display": "inline-block",
            "text-shadow": "none",
            "text-align": "center",
            "border-radius": "10px",
            "background-color": "black",
            "color": "white",
            "font-size": "2em"
    });
 
    $('.ter__block button').css(
    {
            "background": "#000000",
            "-webkit-border-radius": "10",
            "-moz-border-radius": "10",
            "border-radius": "10px",
            "font-family": "Arial",
            "color": "#ffffff",
            "font-size": "30px",
            "padding": "10px20px10px20px",
            "border": "solid#ffffff3px",
            "text-decoration": "none"
    });
 
    $('#ter__Titre').css(
    {
            "padding-top": "20px"
    });
 
    $('button#ter__colorBlue').css(
    {
            "background-color": "blue"
    });
    $('button#ter__colorBlack').css(
    {
            "background-color": "black"
    });
    $('button#ter__colorGreen').css(
    {
            "background-color": "green"
    });
    $('button#ter__ColorYellow').css(
    {
            "background-color": "yellow"
    });
    $('button#ter__colorWhite').css(
    {
            "background-color": "white"
    });
 
    $('button#ter__colorFontBlue').css(
    {
            "background-color": "blue"
    });
    $('button#ter__colorFontBlack').css(
    {
            "background-color": "black"
    });
    $('button#ter__colorFontGreen').css(
    {
            "background-color": "green"
    });
    $('button#ter__ColorFontYellow').css(
    {
            "background-color": "yellow"
    });
    $('button#ter__colorFontWhite').css(
    {
            "background-color": "white",
            "color": "white",
            "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black"
    });
 
    $('#ter__overlay').css(
    {
            "background": "url('http://sd-1.archive-host.com/membres/up/142586199450897653/fancybox_overlay.png') repeat",
            "width": "auto",
            "height": "auto",
            "display": "block",
            "position": "fixed",
            "bottom": "0",
            "right": "0",
            "top": "0",
            "left": "0",
            "overflow": "hidden",
            "-webkit-border-radius": "5px",
            "-moz-border-radius": "5px",
            "border-radius": "5px"
    });
 
    $('.ter__block').css(
    {
            "background-color": "transparent",
            "color": "white",
            "display": "inline-block",
            "font-family": "Calibri",
            "padding": "10px"
    });
 
    $('#ter__Police').css(
    {
            "display": "block"
    });
}
 
/**
 * Gestion d'events pour l'affichage/disparition du formulaire
 * @author Arlémi Turpault / Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function OverlayHandle()
{
 
    $('#ter__overlay').hide();
    $('#ter__modify').dblclick(function()
    {
        if (!alreadyRun)
        {
            //Evite la double annotation
            main();
            alreadyRun = true;
            //Detection des blocs sémantiques
            DomTree(root, "Discover");
            //remplissage des blocs sémantiques découverts
            FillList();
        }
        $('#ter__modify').hide();
        $('#ter__overlay').fadeIn();
 
    });
    $('button#ter__flush').on('click', function()
    {
        //Vidage du localStorage
        FlushParams();
        alert('Les paramètres ont été réinitialisés avec succès.');
        //On refresh pour avoir une page "de base"
        refresh();
    });
    $('button#ter__cancel').on('click', function()
    {
        //Annulation des parametres effectués a la vollée
        CancelUpdate();
        $('#ter__modify').show();
        $('#ter__overlay').fadeOut();
    });
 
    $('button#ter__confirm').on('click', function()
    {
        //On cache toutes les <img>
        hideImages();
        $('#ter__modify').show();
        $('#ter__overlay').fadeOut();
        SaveParams();
    });
 
    $(document).keydown(function(e)
    {
        //Echap pour fermer
        if (e.keyCode == 27)
        {
            $('#ter__modify').show();
            $('#ter__overlay').fadeOut();
        }
    });
 
    $("button.BtnTaille").mouseenter(function()
    {
        $(this).css("background", "#00ed3f");
    }).mouseleave(function()
    {
        $(this).css("background", "000000");
    });
 
    /* Taille de police */
 
    $('button#ter__downFont').on('click', function()
    {
        if (parseInt($('*').css('font-size')) < 5)
        {
            // do nothing
        }
        else
        {
            //reduction de la police d'écriture
            countSize--;
            DomTree(root, '--');
        }
    });
 
    $('button#ter__upFont').on('click', function()
    {
        //Augmentation de la police d'écriture
        countSize++;
        DomTree(root, '++');
    });
 
     /* Couleurs du fond */
    //Pour chaque couleur, on verifie que la couleur en cours pour la police n'est pas identique,
    //Si oui erreur
    $('button#ter__colorBlue').on('click', function()
    {
            if (color == "blue")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    $('body').css(
                    {
                            "background-color": "blue"
                    });
                    background = "blue";
                    DisplayContrast();
            }
 
    });
    $('button#ter__colorGreen').on('click', function()
    {
            if (color == "green")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    $('body').css(
                    {
                            "background-color": "green"
                    });
                    background = "green";
                    DisplayContrast();
            }
    });
    $('button#ter__colorBlack').on('click', function()
    {
            if (color == "black")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    $('body').css(
                    {
                            "background-color": "black"
                    });
                    background = "black";
                    DisplayContrast();
            }
    });
    $('button#ter__ColorYellow').on('click', function()
    {
            if (color == "yellow")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    $('body').css(
                    {
                            "background-color": "yellow"
                    });
                    background = "yellow";
                    DisplayContrast();
            }
    });
    $('button#ter__colorWhite').on('click', function()
    {
            if (color == "white")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    $('body').css(
                    {
                            "background-color": "white"
                    });
                    //compatibilité CSS < 3
                    background = "white";
                    DisplayContrast();
            }
    });
 
    /* Couleurs du texte */
    //Pour chaque couleur, on verifie que la couleur en cours pour le fond n'est pas identique,
    //Si oui erreur
    $('button#ter__colorFontBlue').on('click', function()
    {
            if (background == "blue")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    color = "blue";
                    DomTree(root, "blue");
                    colorChanged = true;
            }
            DisplayContrast();
 
    });
    $('button#ter__colorFontGreen').on('click', function()
    {
            if (background == "green")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    color = "green";
                    DomTree(root, "green");
                    colorChanged = true;
            }
            DisplayContrast();
    });
    $('button#ter__colorFontBlack').on('click', function()
    {
            if (background == "black")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    color = "black";
                    DomTree(root, "black");
                    colorChanged = true;
            }
            DisplayContrast();
    });
    $('button#ter__ColorFontYellow').on('click', function()
    {
            if (background == "yellow")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    color = "yellow";
                    DomTree(root, "yellow");
                    colorChanged = true;
            }
            DisplayContrast();
    });
    $('button#ter__colorFontWhite').on('click', function()
    {
            if (background == "white")
            {
                    alert(ErrorSameColor);
            }
            else
            {
                    color = "white";
                    DomTree(root, "white");
                    colorChanged = true;
            }
            DisplayContrast();
    });
 
    $('#ter__selectNode').change(function()
    {
        //On cache le formulaire
        $('#ter__modify').show();
        $('#ter__overlay').slideUp();
        //On affiche le div
        displayDivOnly($('#ter__selectNode').val());
    });
}
 
/**
 * Parcours recursivement le dom pour suplanter les parametres.
 * @author Baptiste Leulliette
 * @param {Node} Noeud Dom que l'on traite
 * @param {Fonction} fonction a appliquer sur le param Node
 * @return void
 * @memberof Parametrage
 */
function DomTree(node, action)
{
    var obj = node;
    WorkToDo(obj, action);
    //on filtre tout le plugin avec les id "ter__"
    if (obj.hasChildNodes() && obj.id.indexOf("ter__") == -1)
    {
        var child = obj.firstChild;
        while (child)
        {
            if (child.nodeType === 1)
            {
                DomTree(child, action);
            }
            child = child.nextSibling;
        }
    }
}
/**
 * Application de la fonction "Action" au param Obj
 * @author Baptiste Leulliette
 * @param {Node} Obj - Noeud DOM
 * @param {Fonction} action - Fonction a appliquer sur Obj
 * @return void
 * @memberof Parametrage
 */
function WorkToDo(Obj, action)
{
    //Irrelevant mais on sais jamais... Techniquement on filtre les "ter__" dans la méthode DomTree.
    if (Obj.id.indexOf("ter__") == -1)
    {
        if (action == "++")
        {
            //Text  
            $(Obj).css('font-size', parseInt($(Obj).css('font-size')) + 1 + 'px');
            console.log(countSize);
        }
        if (action == "--")
        {
            $(Obj).css('font-size', parseInt($(Obj).css('font-size')) - 1 + 'px');
            console.log(countSize);
        }
 
        if (action == "black")
        {
            $(Obj).css(
            {
                "color": "black"
            });
        }
        if (action == "blue")
        {
            $(Obj).css(
            {
                "color": "blue"
            });
        }
        if (action == "white")
        {
            $(Obj).css(
            {
                "color": "white"
            });
        }
        if (action == "yellow")
        {
            $(Obj).css(
            {
                "color": "yellow"
            });
        }
        if (action == "green")
        {
            $(Obj).css(
            {
                "color": "green"
            });
        }
 
        if (action == "Discover")
        {
            //Ancienne detection sur les blocs visuel de F. Petitdemange
            /*if ($(Obj).hasClass("VISUAL_STRUCTURE") && !$(Obj).hasClass("NOEUD-ATOMIC-VIRTUEL"))
            {
                if ($(Obj).attr("ter_semantic") != "unknown") {
                    console.log("Decouverte d'un bloc");
                    var CurrentNode = new NodeClass;
                    CurrentNode.Name = $(Obj).attr("ter_semantic");
                    CurrentNode.Node = Obj;
                    NodeArray.push(CurrentNode);
                }
               
            }*/
 
            //Nouvelle detection sur les blocs sémantiques de W. Banguet
            var attr = $(Obj).attr('ter_supertype');
            if (attr == 'co') {
                var semantic = $(Obj).attr("ter_semantic");
                if (semantic != 'unknown') {
                    /*console.log("Decouverte d'un bloc");
                    console.log(semantic);*/
                    var CurrentNode = new NodeClass;
                    CurrentNode.Name = semantic;
                    CurrentNode.Node = Obj;
                    NodeArray.push(CurrentNode);
                }
               
            }
 
           
        }
    }
 
}
 
/**
 * Sauvegarde des parametres saisis
 * @author Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function SaveParams()
{
    localStorage.setItem("Size", countSize);
    localStorage.setItem("Color", color);
    localStorage.setItem("Background", background);
    if ($('input[name="ter__alt_only"]').is(':checked'))
    {
        localStorage.setItem("hideImages", "yes");
    }
    else
    {
        localStorage.setItem("hideImages", "no");
    }
}
 
/**
 * Chargement des parametres saisis depuis le LocalStorage
 * @author Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function LoadParams()
{
    var taille = null;
    taille = localStorage.getItem("Size");

    if (taille !== null)
    {
        // Agrandissement du texte en fonction de la valeur en localStorage
        if (taille > 0)
        {
            for (i = 0; i < taille; i++)
            {
                DomTree(root, "++");
                countSize = taille;
            }
        }
        if (taille < 0)
        {
            taille = taille * -1;
            for (i = 0; i < taille; i++)
            {
                DomTree(root, "--");
                countSize = taille * -1;
            }
        }
    }
 
    color = localStorage.getItem("Color");
    // Changement de la couleur du texte
    if (color === null)
    {
        color = "black";
        DisplayContrast();
    }
    else
    {
        DomTree(root, color);
        DisplayContrast();
    }
 
    background = localStorage.getItem("Background");
    // Changement de la couleur de fond
    if (background === null)
    {
        background = "white";
        DisplayContrast();
    }
    else
    {
        $('body').css(
        {
            "background-color": background
        });
        DisplayContrast();
    }
 
    hideImagesValue = localStorage.getItem("hideImages");
    if (hideImagesValue == "yes")
    {
        $('input[name="ter__alt_only"]').prop('checked', true);
        hideImages();
    }
    else
    {
        $('input[name="ter__alt_only"]').prop('checked', false);
    }
}
 
/**
 * Réinitialisation des parametres
 * @author Arlémi Turpault
 * @return void
 * @memberof Parametrage
 */
function FlushParams()
{
    localStorage.removeItem("Size");
    localStorage.removeItem("Color");
    localStorage.removeItem("Background");
    localStorage.removeItem("hideImages");
}
 
/**
 * Annule les modifications faites à la volée
 * @author Baptiste Leulliette
 * @return void
 * @memberof Parametrage
 */
function CancelUpdate()
{
    // Annulation de la modification de taille de police
    if (countSize > 0)
    {
            for (i = 0; i < countSize + 1; i++)
            {
                    DomTree(root, "--");
                    countSize = 0;
            }
    }
    else
    {
            if (countSize < 0)
            {
                    var c = countSize * -1;
                    console.log(c);
                    for (i = 0; i < c + 1; i++)
                    {
                            DomTree(root, "++");
                            countSize = 0;
                    }
            }
    }
 
    // Annulation du changement de couleur du texte
    if(localStorage.getItem("Color") != null) {
            DomTree(root, localStorage.getItem("Color"));
    }
    // Annulation du changement de couleur du fond
    if(localStorage.getItem("Background")) {
        // cas où il y avait déjà une couleur prédéfinie
        $('body').css(
        {
                "background-color": localStorage.getItem("Background")
        });
    } else {
        // sinon on remet celle d'origine
        $('body').css(
        {
                "background-color": backgroundOrigin
        });
    }
    refresh();
}
 
/**
 * Cache les images et affiche le texte alternatif quand la case est cochée, inverse si case décochée.
 * @author Arlémi Turpault
 * @return void
 * @memberof Parametrage
 */
function hideImages()
{
    // Si la case "afficher texte alternatif" est cochée
    if ($('input[name="ter__alt_only"]').is(':checked'))
    {
        // On sélectionne chaque image
        $('img').each(function()
        {
            // si elle n'est pas cachée
            if ($(this).attr('hide') == 'no')
            {
                // on la cache et la remplace par son texte alternatif,
                var altText = '<span class="ter__alt_text">' + $(this).attr('alt') + '</span>';
                $(this).attr('hide', 'yes').hide().after(altText);
            }
        });
    }
    // sinon
    else
    {
        // on affiche les images cachées et on efface le texte alternatif
        $('img').attr('hide', 'no').show();
        $('span.ter__alt_text').remove();
    }
}
 
/**
 * Gestion du drag and drop du bouton
 * @author https://css-tricks.com/
 * @return void
 * @memberof Parametrage
 */
(function($)
{
    $.fn.drags = function(opt)
    {
 
        opt = $.extend(
        {
            handle: "",
            cursor: "move"
        }, opt);
 
        if (opt.handle === "")
        {
            var $el = this;
        }
        else
        {
            var $el = this.find(opt.handle);
        }
 
        return $el.css('cursor', opt.cursor).on("mousedown", function(e)
        {
            if (opt.handle === "")
            {
                var $drag = $(this).addClass('draggable');
            }
            else
            {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e)
            {
                $('.draggable').offset(
                {
                    top: e.pageY + pos_y - drg_h,
                    left: e.pageX + pos_x - drg_w
                }).on("mouseup", function()
                {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function()
        {
            if (opt.handle === "")
            {
                $(this).removeClass('draggable');
            }
            else
            {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });
 
    }
})(jQuery);
 
/**
* Remplis la liste déroulante du formulaire
* @author Baptiste Leulliette
* @return void
* @memberof Parametrage
*/
function FillList() {
    var e = "";
    //On recupere le tableau NodeArray, qui a été précedemment rempli par la fonction domTree("Discover"); et grace à notre pseudo classe
    for (var i = 0; i < NodeArray.length; i++)
    {
        e += '<option value="' + i + '"> ' + NodeArray[i].Name + '</option>';
    }
    $("#ter__selectNode").append(e);
}
 
/**
* Convertis une valeur hexadecimal en valeur RGB
* @return integer
* @memberof Parametrage
*/
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
 
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
 
/**
* Retourne la couleur décimale de la couleur hexa
* @author Baptiste Leulliette
* @return integer
* @memberof Parametrage
*/
function getBritghtness(R, G, B) {
        //Loi pour la generation de la "luminance"
        return ((red * 299) + (Green * 587) + (Blue * 114)) / 1000;
}
 
/**
* Calcule la différence entre la couleur de fond et le texte
* @author Baptiste Leulliette
* @return void
* @memberof Parametrage
*/
function DisplayContrast() {
        var cPolice;
        var cFond;
        switch (color) {
                case "black":
                        cPolice = "#000000";
                        break;
                case "blue":
                        cPolice = "#0000FF";
                        break;
                case "yellow":
                        cPolice = "#FFFF00";
                        break;
                case "white":
                        cPolice = "#FFFFFF";
                        break;
                case "green":
                        cPolice = "#008800";
                        break;
                default:
                        break;
        }
 
        switch (background) {
                case "black":
                        cFond = "#000000";
                        break;
                case "blue":
                        cFond = "#0000FF";
                        break;
                case "yellow":
                        cFond = "#FFFF00";
                        break;
                case "white":
                        cFond = "#FFFFFF";
                        break;
                case "green":
                        cFond = "#008800";
                        break;
                default:
                        break;
        }
 
        //get des couleurs OK
        var hexPolice = hexToRgb(cPolice);
        var hexFond = hexToRgb(cFond);
       
        var total = (maximum(hexPolice.r, hexFond.r) - minimum(hexPolice.r, hexFond.r)) + (maximum(hexPolice.g, hexFond.g) - minimum(hexPolice.g, hexFond.g)) + (maximum(hexPolice.b, hexFond.b) - minimum(hexPolice.b, hexFond.b));
        console.log(total);
        $('#ter__indContrast').text(Math.floor(total*100/765) + "%");
        console.log("Ratio (en %) : " + total*100/765);
        console.log("Ratio suffisant (flat) = 500");
        console.log("Ratio suffisant (en %) = 63.35%");
}
 
/**
* Retourne le maximum entre deux valeurs
* @author Baptiste Leulliette
* @return integer
* @memberof Parametrage
*/
function maximum (i1, i2) {
        if (i1 >= i2) {
                return i1;
        }
        return i2;
}
 
/**
* Retourne le minimum entre deux valeurs
* @author Baptiste Leulliette
* @return integer
* @memberof Parametrage
*/
function minimum (i1, i2) {
        if (i1 >= i2) {
                return i2;
        }
        return i1;
}