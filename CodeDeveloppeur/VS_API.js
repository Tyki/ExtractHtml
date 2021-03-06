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


/**
* VS_API
* @namespace API_Annotation
*/

/**
 * VS_API
 * @namespace API_Extraction
 */

/**
* Fonction récursive réalisant :  1- Filtrage des noeuds non intéressants
*                                 2- Le repérage et l'annotation des Noeuds Atomiques Virtuels(Virtual Content Node)
*                                 3- la non-recopie d'un noeud "divisible", c'est a dire un noeud pouvant être omis dans l'arbre des structures visuelles, ses enfants se voyant adoptés par son parent. 
* Elle parcourt les éléments de l'arbre DOM tant qu'elle ne rencontre pas de bloc visuel, si c'est le cas, le noeud contenant le bloc visuel est ajouté dans la variable pool passée en parametre.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @param {int} nLevel - Entier représentant la profondeur courante dans l'arbre des structures visuelles
* @param {List<Node>} pool - Ensemble des noeuds du DOM qui seront frères dans l'arbre des Structures visuelles
* @return void
* @memberof API_Extraction
*/
function DOMNodeDivision(DOMNode, nLevel, pool) {    


    //HEURISTIQUE 1
    if (filter(DOMNode)) {
	//console.log("noeud filtré",DOMNode);
	annotation(DOMNode, 'noeudfiltré1');
	return -1;
    }

    //elements filtés
    //Filtre DOMNode si il n'a pas d'enfants valides
    if (!isHr(DOMNode) && !existChild(DOMNode, isValidNode)) {

 	if (DOMNode.nodeName != "IMG" 
	    && DOMNode.nodeName != "INPUT" 
	    && DOMNode.nodeName != "A"
	    && DOMNode.nodeName != "IFRAME")
	{ 
	    annotation(DOMNode, 'noeudfiltré-2');
	    return -1; 
	}        
    }

    if (isElementFromPlugin(DOMNode))
    {
        annotation(DOMNode, 'noeudfiltré-ter');
        return -1;
    }

    //HEURISTIQUE 1-BIS
    if (isVirtualContentNode(DOMNode))
    {
	annotation(DOMNode, "VISUAL_STRUCTURE NOEUD-ATOMIC-VIRTUEL doc-10");
    createBasicObjectProperties(DOMNode);
    setBasicObjectProperties(DOMNode);
    setBasicObjectType(DOMNode);
	pool.push(DOMNode);
	return -1;
    }
    // if ($(DOMNode).css("background-image") != "none")
    // {
    // 	if (!isValidBranch(DOMNode))
    // 	{
    // 	    //console.log("branche-valide-invalide",DOMNode);
    // 	    annotation(DOMNode, "VISUAL_STRUCTURE NOEUD-ATOMIC-VIRTUEL doc-10");
    // 	    pool.push(DOMNode);
    // 	    return -1;
    // 	}
    // }



    
    
    if (divisible(DOMNode, nLevel) == true) 
    {
        var child = DOMNode.firstChild;
        while (child) {
            if (!filter(child)){
                DOMNodeDivision(child, nLevel+1, pool);
            }
            child = child.nextSibling;
        }
    }else{
	if (isVisible(DOMNode))
	{pool.push(DOMNode)}
    }
}






/**
* Fonction retournant un booléen indiquant si le noeud courant représente un bloc visuel ou s'il peut être filtré et voir ses enfants adoptés par son parent. Les règles sont testées une à une et dès que les conditions d'application de l'une d'entre elles sont respectées, la fonction retourne un résultat.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @param {int} nLevel - Entier représentant la profondeur courante dans l'arbre des structures visuelles
* @return {Boolean} ret - Vrai si le noeud doit être divisé (voir description), faux sinon
* @memberof API_Extraction
*/
function divisible(DOMNode, nLevel){


    var relativeSize = getSize(DOMNode) * 100 / pageSize;
    annotation(DOMNode, "tr-"+relativeSize);
    annotation(DOMNode, "ta-"+getSize(DOMNode));

    //le bloc possede un DOC alors on parcourt
    if (getDOC(DOMNode) != "doc-NA") return true;      

    //HEURISTIQUE 2
    if (hasOnlyOneChild(DOMNode, isValidNode)) 
    {
        annotation(DOMNode, "DIVISION RULE2");
        return true;
    }

    //HEURISTIQUE 3	
    //if (regle3(DOMNode) && forAllChildren(DOMNode, isInline)) 
    if(forAllChildren(DOMNode, isContentNode) || forAllChildren(DOMNode, isVirtualContentNode))
    {
        if (!isValidTextNode(DOMNode)) {
            annotation(DOMNode, "VISUAL_STRUCTURE RULE3");
            annotation(DOMNode, " doc-9");
            createCompositeObjectProperties(DOMNode);


        }
        return false;
    }


    //HEURISTIQUE 4
    //si il existe un bloc LINE-BREAK dans les enfants, alors on divise
    if (!forAllChildren(DOMNode, isInline) && existChild(DOMNode, isSupRule4Treshold)) 
    {
	//console.log("regle-4",DOMNode); 
	annotation(DOMNode, "DIVISION RULE4");
        return true;
    }   

    //HEURISTIQUE 7
    var firstChild = getFirstValidChild(DOMNode);
    if(firstChild != "" && isTitleElement(firstChild))
    {
	//console.log("regle-7",DOMNode);
	var doc = "doc-"+processDoc(DOMNode);
	annotation(DOMNode, "VISUAL_STRUCTURE RULE7");
	annotation(DOMNode, doc);
    createCompositeObjectProperties(DOMNode);

	return false;
    }

    

    //HEURISTIQUE 5
    //il existe un noeud HR dans les enfants
    if (existChild(DOMNode, isHr)) 
    {
	var children = DOMNode.childNodes;
	var nbChildren = children.length;


	for(var i = 0; i < nbChildren; i++){
	    if (children[i].nodeName == "HR")
	    {
		//console.log(previousValidSibling(fils[i]));
		var pred = previousValidSibling(children[i]);
		if (pred){
		    annotation(pred, "visualStruct-"+nLevel+ " RULE5 pred");
		    annotation(pred, "doc-3");}
                    createCompositeObjectProperties(pred);


		var succ = nextValidSibling(fils[i]);
		if (succ){
		    annotation(succ, "visualStruct-"+nLevel+ " RULE5 succ");
		    annotation(succ, "doc-3");}
                    createCompositeObjectProperties(succ);

	    }
	}
	//console.log(DOMNode);
        return true;
    }   

    //HEURISTIQUE 6
    if (isChildrenSurfaceSup(DOMNode))
    {
	//console.log("regle-6",DOMNode);
	var doc = "doc-"+processDoc(DOMNode);
	annotation(DOMNode, "VISUAL_STRUCTURE RULE6" + doc);
            createCompositeObjectProperties(DOMNode);


	return false;
    }


    //HEURISTIQUE 8
    var parent = DOMNode.parentNode;
    
    if (visualDistance(DOMNode, parent))
    {
	var doc = "doc-"+processDoc(DOMNode);
	    annotation(DOMNode, "VISUAL_STRUCTURE RULE8 "+doc);
        createCompositeObjectProperties(DOMNode);
	// console.log("heuristique-8 verifiée",DOMNode);
	
	return false;
    }


    //HEURISTIQUE 9
    if((getSize(biggestChild(DOMNode)) * 100 / pageSize) < rule9Treshold)
    {
	var doc = "doc-"+processDoc(DOMNode);
	annotation(DOMNode, "VISUAL_STRUCTURE RULE9 "+doc);
    createCompositeObjectProperties(DOMNode);

	return false;
    }
    
    //HEURISTIQUE 10
    annotation(DOMNode, "DIVISION NORULE");
    
    return true;
                  //console.log("SORTIE DIVISIBLE");

}


/**
* Fonction retournant le premier prédecesseur valide(non filtrable) du noeud passé en paramètre, renvoie faux s'il n'y en a aucun.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Node/Boolean} ret - le noeud valide frère précédent DOMNode s'il existe, faux sinon.
* @memberof API_Extraction
*/
function previousValidSibling(DOMNode){
    while(DOMNode.previousSibling)
    {
	if (!filter(DOMNode.previousSibling))		
	    return DOMNode.previousSibling;
	DOMNode =  DOMNode.previousSibling;
    }
    return false;
}


/**
* Fonction retournant le premier successeur valide(non filtrable) du noeud passé en paramètre, renvoie faux s'il n'y en a aucun.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Node/Boolean} ret - le noeud valide frère suivant DOMNode s'il existe, faux sinon.
* @memberof API_Extraction
*/
function nextValidSibling(DOMNode){
    while(DOMNode.nextSibling)
    {
	if (!filter(DOMNode.nextSibling))		
	    return DOMNode.nextSibling;
	DOMNode =  DOMNode.nextSibling;
    }
    return false;
}


/**
* Fonction retournant la taille de la balise contenue dans le noeud passé en paramètre
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Int} retour - Taille de la balise contenue dans DOMNode
* @memberof API_Extraction
*/
function processDoc(DOMNode){
    var retour = 0;
    if(tagSize[DOMNode.nodeName])
	retour = tagSize[DOMNode.nodeName];
    return retour;
}




/**
* Fonction de comparaison retournant vrai si les deux noeuds passés en paramètres respectent les critères définis de distance visuelle. C'est à dire s'ils ont des propriétés de style qui attestent d'une hétérogénéité de contexte entre eux.
* @author Franck Petitdemange
* @param {Node} DOMNode1 - un noeud DOM sur lequel sera effectuée la comparaison.
* @param {Node} DOMNode2 - l'autre noeud DOM sur lequel sera effectuée la comparaison
* @return {Boolean} ret - vrai si DOMNode1 et DOMNode2 sont visuellement différents, faux sinon.
* @memberof API_Extraction
*/
function visualDistance(DOMNode1, DOMNode2){
    
    if ($(DOMNode1).css("background-image") != $(DOMNode2).css("background-image")
	||$(DOMNode1).css("background-color") != $(DOMNode2).css("background-color"))
    {
	//console.log("distance-visuelle sur background");
	//annotation(DOMNode1, "distance-visuelle:background");
	return true;
    }
    
    
    if ($(DOMNode1).css("border-style") != $(DOMNode2).css("border-style")
	|| $(DOMNode1).css("border-bottom") != $(DOMNode2).css("border-bottom")
	|| $(DOMNode1).css("border-bottom-color") != $(DOMNode2).css("border-bottom-color")
	|| $(DOMNode1).css("border-bottom-width") != $(DOMNode2).css("border-bottom-width")
	|| $(DOMNode1).css("border-bottom-style") != $(DOMNode2).css("border-bottom-style")
	|| $(DOMNode1).css("border-top") != $(DOMNode2).css("border-top")
	|| $(DOMNode1).css("border-top-color") != $(DOMNode2).css("border-top-color")
	|| $(DOMNode1).css("border-top-width") != $(DOMNode2).css("border-top-width")
	|| $(DOMNode1).css("border-top-style") != $(DOMNode2).css("border-top-style"))
    {	
	//console.log("distance-visuelle sur bordure");
	//annotation(DOMNode1, "distance-visuelle:bordure");
	return true;
    }   
}



/**
* Fonction renvoyant vrai si la taille relative du noeud par rapport à la taille de la page dépasse le seuil "relativeSizeTreshold", faux sinon.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Boolean} ret - vrai si DOMNode a une taille relative à la page supérieure à relativeSizeTreshold, faux sinon.
* @memberof API_Extraction
*/
function compareTreshold(DOMNode){
    if (!isValidNode(DOMNode)) return false; 
    var relativeT = getSize(DOMNode) * 100 / pageSize;
    //console.log(relativeSizeTreshold +" : "+ relativeT);
    if (relativeSizeTreshold < relativeT) {
        return true;
    }
    return false;
}



/**
* Fonction renvoyant une référence sur le plus grand enfant du noeud passé en paramètre. Plus grand au sens de la taille des balises contenues.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Node} maxChild - Plus grand enfant de DOMNode.
* @memberof API_Extraction
*/
function biggestChild(DOMNode){
    var maxChild = DOMNode.firstChild;

    var child = DOMNode.firstChild;

    while (child) 
    {
	if (!filter(child)) 
	{
	    if (getSize(child) > getSize(maxChild))
	    {
		maxChild = child;
	    }				 
	}
	child = child.nextSibling;
    }
    return maxChild;
}




/**
* Fonction renvoyant vrai si la somme des tailles des balises des enfants est supérieure à la taille du noeud.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Boolean} ret - Vrai si relativeT est supérieur à sumChild, faux sinon.
* @memberof API_Extraction
*/
function isSumChildrenSup(DOMNode){
    var sumChild = 0;
    var relativeT = getSize(DOMNode) * 100 / pageSize;
    var child = DOMNode.firstChild;

    while (child) {
        if (!filter(child)) 
	{
	    //console.log(child.nodeName +" : "+ tagSize[child.nodeName]);
	    if (tagSize[child.nodeName])
	    {
		//console.log(sumChild);
		sumChild = sumChild + tagSize[child.nodeName];
	    }
        }
        child = child.nextSibling;
    }
    //console.log(relativeT +" : "+ sumChild);
    annotation(DOMNode, "sNoeud-"+sumChild);
    if (relativeT > sumChild)
	return true;

    return false;
}




/**
* Fonction renvoyant vrai si la somme des surfaces occupées par les enfants est supérieure à celle occupée par le noeud passé en paramètre, faux sinon.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Boolean} ret - Vrai si sumChild est supérieur à la surface de DOMNode, faux sinon.
* @memberof API_Extraction
*/
function isChildrenSurfaceSup(DOMNode){

    var sumChild = 0;

    var child = DOMNode.firstChild;

    while (child) {

        if (!filter(child) && isElement(child) && !isImg(child)) 
	{
	    sumChild = sumChild + getNodeSurface(child);
        }
        child = child.nextSibling;
    }

    annotation(DOMNode, "surfNoeud-"+getNodeSurface(DOMNode));
    annotation(DOMNode, "surfNoeudEnf-"+sumChild);

    if (sumChild > getNodeSurface(DOMNode) * 1.01)
	return true;

    return false;
}



/**
* Fonction retournant la surface occupée par le noeud passé en paramètre
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Int} ret - Surface occupée par DOMNode
* @memberof API_Extraction
*/
function getNodeSurface(DOMNode){
    var elementNode = $(DOMNode);
    var width = elementNode.width();
    var height = elementNode.height();
    //console.log(DOMNode);
    //console.log(width * height);
    annotation(DOMNode, "surfNoeud-"+ (width * height));
    return width * height;
}



/**
* Fonction retournant le nombre de Noeuds de contenu virtuels parmis les enfants du noeud passé en paramètre.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Int} ret - Nombre de Virtual Content Nodes dans DOMNode
* @memberof API_Extraction
*/
function countContentChildren(DOMNode){
    var compteur = 0;

    var fils = DOMNode.childNodes;
    var nbFils = fils.length;

    //feuille
    if (nbFils == 0)	{ 
	return 0;
    }

    for(var i = 0; i < nbFils; i++)
    {
	//var filsCourant = fils[i];
	//console.log(fils[i].style.display);
	if (isContentNode(fils[i]))
	{
	    compteur = compteur + 1;		
	}
    }

    return compteur;
}



/**
* Fonction retournant le nombre de Noeuds valides parmis les enfants du noeud passé en paramètre.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Int} ret - Nombre de noeuds valides dans DOMNode
* @memberof API_Extraction
*/
function countValidChildren(DOMNode){
    var count = 0;

    var children = DOMNode.childNodes;
    var childrenNb = children.length;

    //feuille
    if (childrenNb == 0)	{ 
	return 0;
    }

    for(var i = 0; i < childrenNb; i++)
    {
	if (isValidNode(children[i]))
	{
	    count = count + 1;		
	}
    }

    return count;
}


/**
* Fonction retournant le premier enfant valide rencontré parmis les enfants du noeud passé en paramètre.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Node} ret - Premier noeud valide rencontré, enfant de DOMNode. "" s'il n'existe pas.
* @memberof API_Extraction
*/
function getFirstValidChild(DOMNode){
    var child = DOMNode.firstChild;

    while (child) {

        if (!filter(child)) 
	{
	    return child;
        }
        child = child.nextSibling;
    }
    return "";
}



/**
* Fonction retournant vrai si le nombre d'enfants noeuds de contenu est supérieur au nombre d'autres enfants.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Boolean} ret - Vrai si DOMNode contient une majorité d'enfants noeuds de Contenu, faux sinon
* @memberof API_Extraction
*/
function isNbContentChildrenSup(DOMNode){
    
    var nbContentChildren = countContentChildren(DOMNode);
    var nbNonContentChildren = DOMNode.childNodes.length - nbContentChildren;
    //annotation(DOMNode, ""+nbNonContentChildren+"-"+nbContentChildren);
    return (nbContentChildren >= nbNonContentChildren);
}





/**
* Fonction renvoyant la somme des poids des balises contenues dans les enfants du noeud passé en paramètre. Les poids attibués aux différentes balises sont décrits dans le fichier VS_Params. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Int} ret - Somme des poids des balises contenues dans les enfants de DOMNode.
* @memberof API_Extraction
*/
function getSize(DOMNode){
    var count = 0;
    
    var fils = DOMNode.childNodes;
    var nbFils = fils.length;
    
    if (nbFils == 0)	{ 
	if (DOMNode.nodeType == 3 && isValidTextNode(DOMNode)) 
	{
	    return (DOMNode.textContent.length * 3); // ponderation texte
	}
	return 0;	
    }    
    
    for(var i = 0; i < nbFils; i++){
	if (tagSize[DOMNode.nodeName]){
	    count = count + tagSize[DOMNode.nodeName] + getSize(fils[i]);
	}else{
	    count = count + getSize(fils[i]);
	}	
    }
    
    return count;
}


/**
* Procédure de debug affichant sur la console les informations du noeud passé en paramètre. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return void
* @memberof API_Extraction
*/
function printNode(DOMNode) {
    var id = "N/A";
    if (!isValidTextNode(DOMNode)) id = DOMNode.getAttribute("id");
    return "type : "+ DOMNode.nodeType +" - tag : "+ DOMNode.nodeName + " id : "+id + "classe : "+DOMNode.className;
}



/**
* Procédure d'annotation originale de F.P. ajoutant la String value passée en paramètre à l'attribut Class du noeud. Aboutit a une chaine de debug retraçant l'historique du noeud. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @param {String} value - Chaine a ajouter à DOMNode.className.
* @return void
* @memberof API_Extraction
*/
function annotation(DOMNode, value){
    DOMNode.className = DOMNode.className + " " + value;
}




/**
* Fonction permettant de récupérer les informations du noeud passé en paramètre, stocké dans la chaine annotation. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {String} ret - Informations que le plugin d'extraction a associé au noeud DOMNode.
* @memberof API_Extraction
*/
function getDOC(DOMNode) {
    var ret = "";
    var annotString = DOMNode.className;
    annotString = annotString.split(" ");

    for (var key in annotString){
	if (annotString[key].match("doc-*")) return annotString[key];}

    return "doc-NA";

}



/**
* Fonction permettant de récupérer le numéro contenu dans l'information du noeud passé en paramètre, stocké dans la chaine annotation 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {String} ret - Numéro dans l'information que le plugin d'extraction a associé au noeud DOMNode.
* @memberof API_Extraction
*/
function getDOCValue(DOMNode) {
    var ret = "";
    var annotString = DOMNode.className;
    annotString = annotString.split(" ");

    for (var key in annotString){
	if (annotString[key].match("doc-*")) {
	    ret = annotString[key].split("-")[1];
	    return ret;
	}
    }

    return "doc-NA";

}



/**
* Fonction permettant de récupérer l'identifiant du noeud passé en paramètre, stocké dans la chaine annotation 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {String} ret - Identifiant que le plugin d'extraction a associé au noeud DOMNode.
* @memberof API_Extraction
*/
function getID(DOMNode) {
    var retour = "";
    var annotString = DOMNode.className;
    annotString = annotString.split(" ");

    for (var key in annotString){
	if (annotString[key].match("id-*")) return annotString[key];}

    return "id-NA";

}




/**
* Fonction permettant de récupérer la taille relative d'un noeud, stockée dans la chaine annotation. 
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM à traiter
* @return {String} ret - Chaine représentant la taille relative de DOMNode.
* @memberof API_Extraction
*/
function getRelativeSize(DOMNode) {
    var ret = "0";
    var annotString = DOMNode.className;

    annotString = annotString.split(" ");
    for (var key in annotString)
    {
	if (annotString[key].match("tr-*"))
	{
	    ret = annotString[key].split("-")[1];
	}
    }
    return retour;
}


/**
* Fonction booléenne unaire testant si le noeud passé en paramètre fait partie ou non des noeuds formant le formulaire de saisie des préférences utilisateur du plugin. Appel à cette fonction dans la fonction divisible afin de ne pas représenter dans l'arbre des Structures Visuelles les noeuds ajoutés par nos soins dans l'arbre de la page. 
* @author Warren Banguet
* @param {Node} DOMNode - noeud DOM à traiter
* @return {Boolean} ret - Vrai si l'ID de DOMNode contient l'expression "ter__", faux sinon
* @memberof API_Extraction
*/
function isElementFromPlugin(DOMNode) {
    //console.log("nodeID : " + DOMNode.getAttribute('id'));
    
    var nodeID = DOMNode.getAttribute('id');
    if (nodeID != null)
    {
        //console.log("Match _ter ? " + nodeID.match(/ter__/) + "\n\n");
        if (nodeID.match(/ter__/) != null )
            return true;
    }
    return false;
}


/**
* Procédure créant et initialisant (à leur valeur par défaut), dans le noeud DOMNode passé en paramètre, les différents attributs relatifs aux Objets Basiques. Les appels à cette procédure ont été insérés dans le parcours de l'arbre DOM du script d'Extraction dès qu'un Noeud de Contenu Virtuel (VCN : Virtual Content Node) est détecté. 
* @author Warren Banguet
* @param {Node} DOMNode - noeud DOM à traiter
* @return void
* @memberof API_Annotation
*/
function createBasicObjectProperties(DOMNode)
{
    //DOMNode.setAttribute("presentation_layout","");
    DOMNode.setAttribute("presentation_media","text");
    //DOMNode.setAttribute("presentation_encoding","");
    DOMNode.setAttribute("presentation_textlength","0");
    DOMNode.setAttribute("semanteme","unknown");
    DOMNode.setAttribute("hyperlink", "none");
    DOMNode.setAttribute("decoration","0");
    DOMNode.setAttribute("interaction","display");
    DOMNode.setAttribute("ter_supertype","bo");
    DOMNode.setAttribute("ter_type","unknown_bo");

}

/**
* Procédure créant et initialisant (à leur valeur par défaut), dans le noeud DOMNode passé en paramètre, les différents attributs relatifs aux Objets Composites. Les appels à cette procédure ont été insérés dans le parcours de l'arbre DOM du script d'Extraction dès qu'une Structure Visuelle (VS : Visual Structure) est détectée. 
* @author Warren Banguet
* @param {Node} DOMNode - noeud DOM à traiter
* @return void
* @memberof API_Annotation
*/
function createCompositeObjectProperties(DOMNode)
{
    DOMNode.setAttribute("clustering", "");
    DOMNode.setAttribute("root_children_nb", "0");
    DOMNode.setAttribute("ter_supertype","co");
    DOMNode.setAttribute("ter_type","unknown_co");
    DOMNode.setAttribute("ter_semantic", "unknown");


}

/**
* Procédure analysant le noeud DOM (représentant un Objet Basique) passé en paramètre afin de donner une valeur à ses propriétés basiques telles que définies dans notre démarche (Voir rapport). 
* @author Warren Banguet
* @param {Node} DOMNode - noeud DOM à traiter
* @return void
* @memberof API_Annotation
*/
function setBasicObjectProperties(DOMNode)
{
    //console.log("coucou j'essaie de tester l'objet " + DOMNode.getAttribute("id"));
    if (DOMNode.nodeName.match(/H[0-9]/))
    {
       
        DOMNode.setAttribute("semanteme","title");
    }

    if (DOMNode.nodeName == "SELECT")
    {
        DOMNode.setAttribute("interaction", "button");

    }
    else if (DOMNode.nodeName == "INPUT")
    {
        DOMNode.setAttribute("interaction","unknown");
        var AttrType = DOMNode.getAttribute("type");
        if ((AttrType == "button") || (AttrType == "checkbox") || (AttrType == "radio") || (AttrType == "search") || (AttrType == "submit"))
        {
            DOMNode.setAttribute("interaction","button");
        }
        else
        {
            if ((AttrType == "color") || (AttrType == "text") || (AttrType == "password") || (AttrType == "url") || (AttrType == "email") || (AttrType == "tel") || (AttrType == "search"))
            {
                DOMNode.setAttribute("interaction","input");
            }
        }
    }
    else if (DOMNode.nodeName == "BUTTON")
    {
        DOMNode.setAttribute("interaction","button");
    }
    else  if (DOMNode.nodeName == "A")
            {
                //var href = child.getAttribute('href');
                //console.log("href : " + child.hostname);
                //console.log("hostname : " + location.hostname + "\n\n");
                DOMNode.setAttribute("hyperlink", "unknown");
                if (DOMNode.hostname != location.hostname)
                {
                    
                    DOMNode.setAttribute("hyperlink","extern");
                }
                else
                {
                    DOMNode.setAttribute("hyperlink", "intern");
                    

                }
                
                
            }
    else
    {


        var child = getFirstValidChild(DOMNode);

        while (child) 
        {
             var textLength = child.textContent.length;
             var sum = textLength + parseInt(DOMNode.getAttribute("presentation_textlength"));
             DOMNode.setAttribute("presentation_textlength", sum.toString());

            if (child.nodeName == "IMG")
                DOMNode.setAttribute("presentation_media", "img");
            else
            {
                grandChild = getFirstValidChild(child);
                while (grandChild)
                {
                    if (grandChild.nodeName == "IMG")
                    {
                        DOMNode.setAttribute("presentation_media", "img");
                    }
                    grandChild = nextValidSibling(grandChild);
                }
            }
            if (child.nodeName == "A")
            {
                //var href = child.getAttribute('href');
                //console.log("href : " + child.hostname);
                //console.log("hostname : " + location.hostname + "\n\n");
                DOMNode.setAttribute("hyperlink", "unknown");
                if (child.hostname != location.hostname)
                {
                    
                    DOMNode.setAttribute("hyperlink","extern");
                }
                else
                {
                    DOMNode.setAttribute("hyperlink", "intern");
                    

                }
                
                
            }
            else 
            {
                if (child.nodeName == "INPUT")
                {
                    DOMNode.setAttribute("interaction","unknown");
                    var AttrType = child.getAttribute("type");
                    if ((AttrType == "button") || (AttrType == "checkbox") || (AttrType == "radio") || (AttrType == "search") || (AttrType == "submit"))
                    {
                        DOMNode.setAttribute("interaction","button");
                    }
                    else
                    {
                        if ((AttrType == "color") || (AttrType == "text") || (AttrType == "password") || (AttrType == "url") || (AttrType == "email") || (AttrType == "tel") || (AttrType == "search"))
                        {
                            DOMNode.setAttribute("interaction","input");
                        }
                    }
                }
                
            }

            child = nextValidSibling(child);
        }
    }
    
  
    
    
}

/**
* Procédure analysant les propriétés basiques du noeud DOM (représentant un Objet Basique) passé en paramètre afin de donner une valeur à l'attribut ter_type représentant la fonctionnalité offerte à l'utilisateur par cet Objet Basique.
* @author Warren Banguet
* @param {Node} DOMNode - noeud DOM à traiter
* @return void
* @memberof API_Annotation
*/
function setBasicObjectType(DOMNode)
{

    if (DOMNode.getAttribute("hyperlink") != "none")
    {
        if (DOMNode.getAttribute("hyperlink") == "extern")
        {
            DOMNode.setAttribute("ter_type", "external_navigation");
        }
        else
        {
            if (DOMNode.getAttribute("presentation_media") != "img")
            {
                DOMNode.setAttribute("ter_type", "internal_navigation");
            }
            else
            {
                DOMNode.setAttribute("ter_type", "special_navigation");
            }
        }
    }
    else
    {
        if (((parseInt(DOMNode.getAttribute("presentation_textlength")) > textLengthTreshold) || (DOMNode.getAttribute("presentation_media") == "img")) && (DOMNode.getAttribute("interaction") == "display"))
        {
            DOMNode.setAttribute("ter_type", "information");
        }
        else
        {
            if(DOMNode.getAttribute("interaction") != "display")
            {
                DOMNode.setAttribute("ter_type", "special_control");

            }
            else
            {
                DOMNode.setAttribute("ter_type", "information");

            }
        }
    }
}


/**
* Procédure réalisant un parcours en profondeur de l'arbre des Structures Visuelles à partir du noeud passé en paramètre. Pour chaque Objet Composite rencontré, ses propriétés Composites sont déduites de celles des Objets le composant, puis la fonctionnalité qu'il offre est déduite de ces dernières. Cette procédure est appellée après que le script d'extraction ait terminé afin de donner une fonction à tous les Objets Composites de l'arbre des Structures Visuelles en vue d'en déduire leur sémantique.
* @author Warren Banguet
* @param {Node} VSNode - noeud courant de l'arbre des Structures Visuelles.
* @return void
* @memberof API_Annotation
*/
function processAllCO(VSNode)
{
    if ((VSNode.getAttribute("ter_supertype") == "co") || (VSNode.id == root.id))
    {


        var children = VSNode.childNodes;
        var childrenNb = children.length;

        //console.log("Debut de l'appel property sur le noeud : " + VSNode.nodeName + VSNode.getAttribute("id"));
        for(var i = 0; i < childrenNb; i++)
        {
               // console.log("on teste le fils : " + children[i].nodeName + children[i].getAttribute("id"));
                if (children[i].getAttribute("ter_supertype") == "co")
                {
                    //console.log("... et il passe");
                    processAllCO(children[i]);

                }
           
        }
        if (VSNode.id != root.id)
        {
            setCOProperties(VSNode);
            setCOtype(VSNode);
        }
        //console.log("On peut annoter le noeud : " + VSNode.nodeName + VSNode.getAttribute("id"));

    }
    
}

/**
* Procédure analysant le noeud VS (représentant un Objet Composite) passé en paramètre afin de donner une valeur à ses propriétés Composites telles que définies dans notre démarche (Voir rapport). Cette fonction est appellée dans un contexte où l'on est sur que le noeud passé en paramètre est un Objet Composite.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter. Doit représenter un CO.
* @return void
* @memberof API_Annotation
*/
function setCOProperties(VSNode)
{
    //console.log("\n\n ENTREE DANS SETCLUSTERING POUR LE NOEUD " + VSNode.nodeName + VSNode.getAttribute("id"));

    var rootChildrenCount = 0;
    childrenTypesCount = new Map();
    child = VSNode.firstChild;

    while (child)
    {
        if (child.nodeName.match(/H[0-9]/) == null)
            rootChildrenCount++;
        
       // console.log("enfant num : " + rootChildrenCount);
        var childType = child.getAttribute("ter_type");
                

        if (childType.match("navigation") != null)
            childType = "navigation";

       // console.log(String(childType));
        
        if (!childrenTypesCount.has(childType))
        {
            //console.log(childType + " non present dans la map");
            childrenTypesCount.set(childType, 0);
        }
       //console.log(childrenTypesCount.get(childType));

        if (child.getAttribute("ter_supertype") == "bo")
        {
            childrenTypesCount.set(childType, childrenTypesCount.get(childType) + 1);

        }
        else //if (child.getAttribute("clustering") == "parallel")
        {
            childrenTypesCount.set(childType, (childrenTypesCount.get(childType) + parseInt(child.getAttribute("root_children_nb"))));
            rootChildrenCount = rootChildrenCount + parseInt(child.getAttribute("root_children_nb")) -1;
        }
       /* else
        {
            childrenTypesCount.set(childType, childrenTypesCount.get(childType) + 1);

        }*/
        //console.log(childrenTypesCount.get(childType));
        

        child = child.nextSibling;
    }

    VSNode.setAttribute("root_children_nb", String(rootChildrenCount));
    getAssociatedDOMNode(VSNode).setAttribute("root_children_nb", String(rootChildrenCount));

    maxTypeCount = 0;
    maxType = "";
    for (var [key, value] of childrenTypesCount.entries()) 
    {
        //console.log(key + " ==> " + value);
        if (maxTypeCount < value)
        {
            maxTypeCount = value;
            maxType = key;
        }

    }
    //console.log("maxType : " + maxType + " avec " + maxTypeCount);

    if (((maxTypeCount/rootChildrenCount) > 0.7) && (childrenTypesCount.size < 3) && (maxType != "unknown_co") && (areChildrenPositionsRegular(VSNode)))
    {
            //console.log("TEST REGULAR : " + areChildrenPositionsRegular(VSNode));
            VSNode.setAttribute("clustering", "parallel");
            getAssociatedDOMNode(VSNode).setAttribute("clustering", "parallel");
            VSNode.setAttribute("ter_type", maxType);
            getAssociatedDOMNode(VSNode).setAttribute("ter_type", maxType);
        
    }
    
    else
        {
            VSNode.setAttribute("clustering", "complement");
            getAssociatedDOMNode(VSNode).setAttribute("clustering", "complement");
        }
}


/**
* Procédure analysant les propriétés Composites du noeud VS (représentant un Objet Composite) passé en paramètre mais aussi l'attribut ter_type représentant la fonctionnalité offerte à l'utilisateur par cet Objet Composite, ceci couplé à la position de l'Objet Composite dans la page nous permet de déterminer la sémantique de cette Structure Visuelle, c'est à dire quelle grande Structure Abstraite du web elle décrit. L'environnement lors de l'appel à cette fonction nous assure que le noeud VS passé en paramètre représente bien un Objet Composite.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter. Doit représenter un CO.
* @return void
* @memberof API_Annotation
*/
function setCOtype(VSNode)
{
   
    if (VSNode.getAttribute("clustering") == "parallel")
    {
        if (VSNode.getAttribute("ter_type") == "navigation")
        {
            position = getPositionNode(VSNode);
            if (position == "Left")
            {
                changeChildrenSemantic(VSNode, "MainMenu");
                VSNode.setAttribute("ter_semantic", "MainMenu");
                getAssociatedDOMNode(VSNode).setAttribute("ter_semantic", "MainMenu");
            }
            else if (position == "Right")
            {
                changeChildrenSemantic(VSNode, "SecMenu");
                VSNode.setAttribute("ter_semantic", "SecMenu");
                getAssociatedDOMNode(VSNode).setAttribute("ter_semantic", "SecMenu");
            }
            else if (position == "Top")
            {
                if (isHorizontal(VSNode))
                {
                    VSNode.setAttribute("ter_semantic", "Arianne");
                    getAssociatedDOMNode(VSNode).setAttribute("ter_semantic", "Arianne");
                }
            }
            else if (position == "Bot")
            {
                changeChildrenSemantic(VSNode, "ReferenceList");
                VSNode.setAttribute("ter_semantic", "ReferenceList");
                getAssociatedDOMNode(VSNode).setAttribute("ter_semantic", "ReferenceList");
               
            }
        }
        
    }


    

    // document.getElementsByClassName(enfants.id) accede au noeud du DOM associé au noeud de l'arbre
}

/**
* Procédure parcourant les enfants du noeud de l'arbre des Structures Visuelles passé en paramètre afin de leur donner une sémantique si le parcours précédent n'a pu leur en donner. C'est ce dernier parcours qui permet la reconnaissance des Structures Visuelles Header, Footer et Content. L'appel à cette fonction est réalisé avec comme paramètre la racine de l'arbre des Structures Visuelles afin de donner une sémantique aux CO lui étant directement apparentés.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return void
* @memberof API_Annotation
*/
function setRemainingSemantics(VSNode)
{
    //console.log("entree remaining semantic !");
    child = VSNode.firstChild;
    while(child)
    {
        if (child.getAttribute("ter_supertype") == "co")
        {
            if (child.getAttribute("ter_semantic") == "unknown")
            {
                if (getPositionNode(child) == "Top")
                {
                    child.setAttribute("ter_semantic", "Header");
                    getAssociatedDOMNode(child).setAttribute("ter_semantic", "Header");
                
                }
                else if (getPositionNode(child) == "Bot")
                {
                    child.setAttribute("ter_semantic", "Footer");
                    getAssociatedDOMNode(child).setAttribute("ter_semantic", "Footer");
                
                }
                else
                {
                    child.setAttribute("ter_semantic", "Content");
                    getAssociatedDOMNode(child).setAttribute("ter_semantic", "Content");
                
                }

            }
        }
        child = child.nextSibling;
        
    }
    //console.log("sortie remaining semantics");
}

/**
* Fonction retournant le noeud de l'arbre DOM dont est issu le noeud de l'arbre des Structures Visuelles passé en paramètre. Utilisée afin de répercuter sur les noeuds de l'arbre DOM les valeurs des attributs modifiés dans l'arbre des Structures Visuelles.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return {Node} DOMNode - noeud de l'arbre DOM associé à VSNode
* @memberof API_Annotation
*/
function getAssociatedDOMNode(VSNode)
{
    return (document.getElementsByClassName(VSNode.id)[0]);
}

/**
* Fonction booléenne unaire testant si les enfants du noeud VS passé en paramètre sont disposés de façon régulière. C'est à dire si il sont tous disposés sur une ligne horizontale ou verticale.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return {Boolean} ret - Vrai si une des coordonnées x ou y est la même pour tous les enfants de VSNode, faux sinon.
* @memberof API_Annotation
*/
function areChildrenPositionsRegular(VSNode)
{
    
    child = VSNode.firstChild;
    xCoord = getAssociatedDOMNode(child).offsetLeft;
    yCoord = getAssociatedDOMNode(child).offsetTop;
    testEqual = "z";

    child = child.nextSibling;
    //console.log("\n\n ENTREE DANS REGULAR POUR LE NOEUD " + VSNode.nodeName + VSNode.getAttribute("id"));
    //console.log("référence :   x : " + xCoord + "   y : " + yCoord );
    if (child)
    {
        while (child)
        {
            DOMchild = getAssociatedDOMNode(child);

           // console.log("pour fils : " + child.nodeName + child.getAttribute("id") + " x : " + DOMchild.offsetLeft + "   y : " + DOMchild.offsetTop);

            if ((DOMchild.offsetTop >= (yCoord - 5)) && (DOMchild.offsetTop <= (yCoord + 5)))
            {
                if (testEqual == "z")
                    {
                        testEqual = "y";
                    }


            }
            else if (testEqual == "y")
                return false;

            if  ((DOMchild.offsetLeft >= (xCoord - 5)) && (DOMchild.offsetLeft <= (xCoord + 5)))
            {
                 if (testEqual == "z")
                    {
                        testEqual = "x";
                    }
            }
            else if (testEqual == "x")
                return false;

            child = child.nextSibling;
        }
        return true;
    }
    return false;
}


    /*
        var Map = {};

Map['key1'] = 'value1';
Map['key2'] = 'value2';
You can check if the key exists in multiple ways:

Map.hasOwnProperty(key);
Map[key] != undefined // For illustration // Edit, remove null check
if (key in Map) ...
    */




/**
* Procédure mettant à jour la sémantique des enfants du noeud VS passé en paramètre si ces derniers ont la même sémantique que lui, ceci afin de différencier le conteneur du contenu dans le cas présent.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @param {String} s - string représentant la sémantique associée à VSNode
* @return void
* @memberof API_Annotation
*/
function changeChildrenSemantic(VSNode, s)
{
    child = VSNode.firstChild;
    //console.log("\n\nON MET A JOUR LES ENFANTS DE " + VSNode.nodeName + VSNode.getAttribute("id") + "  LA STRING DE RECHERCHE EST : " + s);
    count = 0;
    while(child)
    {
        //console.log("\non check l'enfant : " + child.nodeName + child.getAttribute("id"));
        if (child.getAttribute("ter_supertype") == "co")
        {
            // console.log("= c'est un co");
            // console.log("== sa semantique : " + child.getAttribute("ter_semantic"));
            if (child.getAttribute("ter_semantic") == s)
            {
                count ++;
                // console.log("=== il passe le test");
                child.setAttribute("ter_semantic", (s + "_part"));
                getAssociatedDOMNode(child).setAttribute("ter_semantic", (s + "_part-" + count));
                // console.log("==== On a changé sa sémantique en : " + child.getAttribute("ter_semantic"));
            }
        }
        child = child.nextSibling;
    }
}

/**
* Fonction booléenne unaire testant si les enfants du noeud VS passé en paramètre sont disposés de façon horizontale. C'est à dire si il sont tous disposés sur une ligne horizontale.
* @author Warren Banguet
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return {Boolean} ret - Vrai si une des coordonnées y est la même pour tous les enfants de VSNode, faux sinon.
* @memberof API_Annotation
*/
function isHorizontal(VSNode)
{
    child = VSNode.firstChild;
    yCoord = getAssociatedDOMNode(child).offsetTop;
    while (child)
    {
        DOMChild = getAssociatedDOMNode(child);
        if ((DOMChild.offsetTop >= (yCoord - 5)) && (DOMChild.offsetTop <= (yCoord + 5)))
        {

        }else{return false;}
        child = child.nextSibling;
    }
    return true;
}


/**
* Fonction unaire retournant une string représentant la position dans la page du noeud VS passé en paramètre. Si aucune position ne peut être déterminée, renvoie null. Nécessite d'avoir au préalable initialisé les seuils via un appel à setupRatio (voir plus bas).
* @author Baptiste Leulliette
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return {String} ret - retourne une des chaines suivantes : "Top", "Bot", "Left", "Right".
* @memberof API_Annotation
*/
function getPositionNode(VSNode)
{


    //on va recuperer la position offset et position du node
    //console.log ("Pour le noeud : " + VSNode.id);

    var assoc = getAssociatedDOMNode(VSNode);
    var jQassoc = $(assoc);
    var offset = $(assoc).offset();
    var height = $(assoc).height();
    var width = $(assoc).width();

    //Verification en haut
    if (offset.top + height < ratioTop) {
       // console.log(jQassoc);
        //console.log("top");
        return "Top";
    }

    //verification a gauche
    else if (offset.left + width < ratioLeft) {
        //console.log(jQassoc);
        //console.log("gauche");
        return "Left";
    }
    //verification a droite
    else if (offset.left > ratioRight) {
        //console.log(jQassoc);
        //console.log("droite");
        return "Right";
    }
    //verification en bas
    else if (offset.top > ratioBottom) {
        //console.log(jQassoc);
        //console.log("bot");
        return "Bot";
    }
    else {
        //Rien.
        return null;
    }

    return null;
    // document.getElementsByClassName(enfants.id) accede au noeud du DOM associé au noeud de l'arbre
}


/**
* Procédure initialisant, en fonction des propriétés de taille de la page, les pourcentages seuils permettant de déterminer la position d'une Structure Visuelle dans la page parmis les valeurs Top, Bot, Left, Right
* @author Baptiste Leulliette
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles à traiter.
* @return void
* @memberof API_Annotation
*/
function setupRatio() {
    var heightPage = document.body.scrollHeight;
    var widthPage = document.body.scrollWidth;
    //Ratios ok
    ratioTop = heightPage * 15 / 100;
    ratioBottom = heightPage * 85 / 100;

    ratioLeft = widthPage * 25 / 100;
    ratioRight = widthPage * 75 / 100;
}




