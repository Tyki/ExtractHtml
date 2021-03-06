/*
  Copyright [2014] [PETITDEMANGE Franck]

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

//PREDICATS VISUAL STRUCTURES API


/**
 * Predicats
 * @namespace Predicats
 */

/**
* Fonction booléenne appliquant une fonction booléenne unaire foo, passée en paramètre, à tous les enfants non filtrables du noeud DOMNode passé en paramètre. Renvoie faux si au moins une des applications de foo à l'un des enfants de DOMNode renvoie faux.
* @author - Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @param {fonction} foo - fonction booléenne unaire
* @return {Boolean} ret - faux si foo renvoie faux pour au moins un enfant, vrai sinon.
* @memberof Predicats
*/
function forAllChildren(DOMNode, foo) {
    var child = DOMNode.firstChild;
    while (child) 
    {

        if (!filter(child)) 
        {
            if (!foo(child)) 
            {
                //console.log("   retour false : " + printNode(child));
		      return false;
            }
        }

        child = child.nextSibling;
    }
    return true;
}



/**
* Fonction booléenne retournant vrai si l'application de la fonction booléenne unaire foo à AU MOINS UN des enfants du noeud DOMNode renvoie vrai. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @param {fonction} foo - fonction booléenne unaire
* @return {Boolean} ret - Vrai si foo renvoie vrai appliquée sur un des enfants de DOMNode, faux sinon.
* @memberof Predicats
*/
function existChild(DOMNode, foo) {
    var child = DOMNode.firstChild;
    while (child) 
    {
        if (foo(child)) 
            return true;

        child = child.nextSibling;
    }
    return false;
}



/**
* Fonction booléenne retournant vrai si l'application de la fonction unaire foo, passée en paramètre, renvoie vrai pour UN ET UN SEUL des enfants du noeud DOMNode passé en paramètre. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @param {fonction} foo - fonction booléenne unaire
* @return {Boolean} ret - Vrai si foo renvoie vrai pour UN ET UN SEUL des enfants de DOMNode, faux sinon.
* @memberof Predicats
*/
function hasOnlyOneChild(DOMNode, foo) {
    var child = DOMNode.firstChild;
    var cmpt = 0;
    while (child) 
    {
        if (foo(child))
            cmpt = cmpt + 1;
        child = child.nextSibling;
    }
    return (cmpt == 1);
}




/**
* Fonction booléenne unaire retournant vrai si la balise contenue dans le noeud DOMNode, passé en paramètre, est une balise de titre.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean} ret - Vrai si le nom du noeud DOMNode vaut H[1-6], faux sinon.
* @memberof Predicats
*/
function isTitleElement(DOMNode){
    if (DOMNode.nodeName == "H1") return true;
    if (DOMNode.nodeName == "H2") return true;
    if (DOMNode.nodeName == "H3") return true;
    if (DOMNode.nodeName == "H4") return true;
    if (DOMNode.nodeName == "H5") return true;
    if (DOMNode.nodeName == "H6") return true;

    return false;
}





/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est un noeud texte valide.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats 
*/
function isValidTextNode(DOMNode) {  
    if (DOMNode.nodeType == 3 && DOMNode.textContent.trim() != '')
	   return true;

    return false;
}



/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est un Noeud de Contenu (ContentNode). Voir définition.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isContentNode(DOMNode) {
    if ((isValidTextNode(DOMNode) && !DOMNode.textContent.match(/^\s+/,'')) || (contentNode[DOMNode.nodeName]))
    	return true;
    
    if (forAllChildren(DOMNode, isValidTextNode))
	   return true;

    return false;
}

/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est un Noeud de Contenu Virtuel (VCN : Virtual Content Node). Voir définition.
* @author Franck Petitdemange
* @param {Node} DOMNode- noeud DOM
* @return {Boolean} 
* @memberof Predicats
*/
function isVirtualContentNode(DOMNode) {
    
    if (forAllChildren(DOMNode, isContentNode))
    {
        //console.log("=======DOMNode : " + DOMNode.id + "\n===value : " + countValidChildren(DOMNode));
        
        //DOMNode.setAttribute("testcount", countValidChildren(DOMNode));

	// console.log("appel isVirtualContentNode : true",DOMNode);
	return true;
    }

    return false;
}

/**
* Fonction booléenne retournant vrai si la balise contenue dans le noeud DOMNode est HR.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isHr(DOMNode) {
    return (DOMNode.nodeName == "HR");
}

/**
* Fonction booléenne retournant vrai si la balise contenue dans le noeud DOMNode est IMG
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isImg(DOMNode) {
    return (DOMNode.nodeName == "IMG");
}


/**
* Fonction booléenne unaire retournant vrai si la balise contenue dans le noeud DOMNode a une propriété css de display valant inline, inline-block, ou si cette balise est présente dans la variable paramètre inlinetab.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isInline(DOMNode) {
    if (isValidTextNode(DOMNode)) 
        {return true};
    //console.log(DOMNode);
    //console.log("           "+inlinetab[DOMNode.nodeName]);
    //console.log("           "+$(DOMNode).css("display"));
    annotation(DOMNode, "isInline-"+$(DOMNode).css("display"));
    return ($(DOMNode).css("display") == "inline" || $(DOMNode).css("display") == "inline-block"  || (inlinetab[DOMNode.nodeName] == true));
}


/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est de type element.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isElement(DOMNode){
    return (DOMNode.nodeType == 1);
}

/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est visible lors de l'affichage de la page.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isVisible(DOMNode){
    if ($(DOMNode).width() <= 0 && $(DOMNode).height() <= 0) 
	   return false;

    return true;
}


/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre est un noeud valide (non filtrable, etc...), voir définition.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isValidNode(DOMNode) {
    
    if (DOMNode.nodeName == "IMG") 
        return true;
    if (DOMNode.nodeName == "A") 
        return true;
    if (DOMNode.nodeName == "BR") 
        return false;
    
    if (filter(DOMNode))
    {	
	   //console.log(DOMNode); 
	   return false;
    }
    
    if (isValidTextNode(DOMNode)) 
        return true;

    if ($(DOMNode).width() <= 0 && $(DOMNode).height() <= 0)
    {
    	annotation(DOMNode, "nonvisible"+$(DOMNode).width()+$(DOMNode).height());
    	return false;
    }

    /*if ($(DOMNode).width() > 0 && $(DOMNode).height() > 0)
      {
      return true;
      }
    */
    

    return true;
}

/**
* Fonction booléenne unaire retournant vrai si la taille relative du noeud DOMNode passé en paramètre est supérieure au seuil fixé pour la règle 4.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isSupRule4Treshold(DOMNode){
    var relativeSize = getSize(DOMNode) * 100 / pageSize;
    //var seuil1 = 60;
    
    return (relativeSize > rule4Treshold);
}

/**
* Fonction booléenne unaire retournant vrai si la branche issue du noeud DOMNode passé en paramètre est valide, c'est à dire si tous ses noeuds sont des noeuds valides.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function isValidBranch(DOMNode){

    if (DOMNode.nodeType != 1 )
	return false;
    
    var children = DOMNode.childNodes;
    var childrenNb =  children.length;

    if (childrenNb == 0)
    {
    	if (DOMNode.nodeType == 3 && isValidTextNode(DOMNode))
    	    return true;
    	if (DOMNode.nodeName == "IMG")
    	{
    	    if ($(DOMNode).width() < 2 || $(DOMNode).height() < 2)
    		  return false;//contenu multimedia n'apportant pas d'information
    	    return true;
    	}
    	if (contentNode[DOMNode.nodeName])
    	    return true;

    	// if ($(DOMNode).css("background-image") != 'none' && ($(DOMNode).width() < 3 || $(DOMNode).height() < 2))
    	//     return false;//contenu multimedia n'apportant pas d'information

    	return false;
    }

    var validBranch = false;
    var child = DOMNode.firstChild;
    while (child && validBranch == false) 
    {
    	if (isValidBranch(child))
    	{
    	    validBranch = true;
    	}
        child = child.nextSibling;
    }
    return validBranch;
}

/**
* Fonction booléenne unaire retournant vrai si le noeud DOMNode passé en paramètre doit être filtré, c'est à dire s'il n'est d'aucune importance pour la détermination de structure visuelles.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @return {Boolean}
* @memberof Predicats
*/
function filter(DOMNode){
 

    if (DOMNode.nodeName == "SCRIPT") return true;
    if (DOMNode.nodeName == "STYLE") return true;
    if (DOMNode.nodeName == "NOSCRIPT") return true;
    if (DOMNode.nodeName == "PARAM") return true;
    if (DOMNode.nodeName == "BR") return true;
    
    if (DOMNode.nodeType == 2) return true;//ATTRIBUT
    if (DOMNode.nodeType == 4 ) return true;//CDATA_SECTION_NODE
    if (DOMNode.nodeType == 5 ) return true;//ENTITY_REFERENCE_NODE	
    if (DOMNode.nodeType == 6 ) return true;//ENTITY_NODE	
    if (DOMNode.nodeType == 7 ) return true;//PROCESSING_INSTRUCTION_NODE	
    if (DOMNode.nodeType == 8 ) return true;//COMMENT_NODE	
    if (DOMNode.nodeType == 9 ) return true;//DOCUMENT_NODE	
    if (DOMNode.nodeType == 10 ) return true;//DOCUMENT_TYPE_NODE	
    if (DOMNode.nodeType == 11 ) return true;//DOCUMENT_FRAGMENT_NODE	
    if (DOMNode.nodeType == 12 ) return true;//NOTATION_NODE

    /*if (DOMNode.nodeType == 3 && DOMNode.textContent.match(/[A-Z]+/))
      {
      console.log(DOMNode);
      return false;
      }*/
    
    
    //console.log("filter() err.", DOMNode.textContent.trim());
    

    //if (DOMNode.nodeType == 3 && DOMNode.textContent.match(/^\s+/))
    //return true;
    
 
    if (DOMNode.nodeType == 3 && isValidTextNode(DOMNode) == false)
	return true;    
    
    if (DOMNode.nodeType != 3 && isVisible(DOMNode) == false) 
	return true;

    // if ($(DOMNode).css("background-image") != "none" && ($(DOMNode).width() < 3 || $(DOMNode).height() < 2))
    // 	return true;//contenu n'apportant pas d'information
    
    return false;
}









// ======== FONCTIONS DEPRECIEES
/*
function isFloat(DOMNode){ 
    //console.log("float-"+$(DOMNode).css("float"));
    return ($(DOMNode).css("float") == "left" || $(DOMNode).css("float") == "right");
}

/*
* Fonction booléenne appliquant une fonction binaire foo, passée en paramètre, à tous les couples résultant du produit cartésien de DOMNode avec l'ensemble de ses enfants. Ici foo(DOMNode, child1), foo(DOMNode, child2), etc... Renvoie faux si l'une des applications de foo à un couple renvoie faux.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @memberof Predicats
*/
/*function forallChildComp(DOMNode, foo) {
    var child = DOMNode.firstChild;
    while (child) 
    {
        if (!filter(child)) 
    {
            if (!foo(DOMNode, child)) return false;
    }
        child = child.nextSibling;
    }
    return true;
}


/*
* Fonction booléenne retournant vrai si l'application de la fonction binaire foo, passée en paramètre, renvoie vrai lorsque appliquée sur les membres d'AU MOINS UN des couples obtenus par le produit cartésien de DOMNode et de l'ensemble de ses enfants.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @memberof Predicats
*/
/*function existChildComp(DOMNode, foo) {
    var child = DOMNode.firstChild;

    while (child) {
        if (foo(DOMNode, child) && isValidNode(child)) return true;
        child = child.nextSibling;
    }
    return false;
}

/*
* Fonction booléenne retournant vrai si l'application de la fonction binaire foo, passée en paramètre, renvoie vrai pour UN ET UN SEUL des couples formés par produit cartésien de DOMNode et de l'ensemble de ses enfants.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM
* @memberof Predicats
*/
/*
function hasOnlyOneChildComp(DOMNode, foo) {
    var child = DOMNode.firstChild;
    var cmpt = 0;
    while (child) {
        if (foo(DOMNode, child)) cmpt = cmpt + 1;
        child = child.nextSibling;
    }
    return (cmpt == 1);
}



function isMultimedia(DOMNode){
    if (DOMNode.nodeName == "IMG") return true;
    if (DOMNode.nodeName == "VIDEO") return true;
    if (isValidTextNode(DOMNode)) return true;

    return false;
}

function isBackgroundcolor(DOMNode1, DOMNode2){
    return (DOMNode1.style.background == DOMNode2.style.background);
}

function isClass(DOMNode, classname){
    //console.log("class "+classname);
    //console.log("DOMNode " + $(DOMNode).is("."+classname));
    if ($(DOMNode).is("."+classname)) return true;
    return false;
}
*/