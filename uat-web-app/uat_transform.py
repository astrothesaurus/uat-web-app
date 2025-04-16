# coding: utf-8

import rdflib
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize the RDF graph
graph = rdflib.Graph()

# defines certain properties within the SKOS-RDF file
prefLabel = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#prefLabel')
broader = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#broader')
Concept = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#Concept')
altLabel = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#altLabel')
ednotes = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#editorialNote')
chnotes = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#changeNote')
scopenotes = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#scopeNote')
example = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#example')
related = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#related')
definition = rdflib.term.URIRef('http://www.w3.org/2004/02/skos/core#definition')
comment = rdflib.term.URIRef('http://www.w3.org/2000/01/rdf-schema#comment')
title = rdflib.term.URIRef('http://purl.org/dc/terms/title')
label = rdflib.term.URIRef('http://www.w3.org/2000/01/rdf-schema#label')
dep = rdflib.term.URIRef('http://www.w3.org/2002/07/owl#deprecated')

def process_rdf_file(uat_file_data):
    """
    Parses the SKOS RDF file and processes its data.

    Args:
        process_rdf_file (str): The RDF file content in XML format.

    Returns:
        tuple: A list of all terms and a hierarchical data structure.
    """
    logger.info("Reading the SKOS file...this may take a few seconds.")

    # reads SKOS-RDF file into a RDFlib graph for use in these scripts
    # uat
    graph.parse(data=uat_file_data, format="xml")

    logger.info("Finished reading the SKOS file.")

    # a list of all concepts
    allconcepts = [gm for gm in graph.subjects(rdflib.RDF.type, Concept)]

    # find all terms that have the given term listed as a broader term, so they are therefore narrower terms
    def getnarrowerterms(term):
        """
        Retrieves narrower terms for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of narrower terms.
        """
        narrowerterms = {}
        terminal = rdflib.term.URIRef(term)
        try:
            for narrowerTerm in graph.subjects(predicate=broader, object=terminal):
                try:
                    narrowerterms[terminal].append(narrowerTerm)
                except KeyError:
                    narrowerterms[terminal] = [narrowerTerm]
            return narrowerterms[terminal]
        except KeyError:
            pass


    # a function to get a list of all broader terms for a term
    def getbroaderterms(term):
        """
        Retrieves broader terms for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of broader terms.
        """
        terminal = rdflib.term.URIRef(term)
        broaderterms = {}
        try:
            for broaderTerm in graph.objects(subject=terminal, predicate=broader):
                try:
                    broaderterms[terminal].append(broaderTerm)
                except KeyError:
                    broaderterms[terminal] = [broaderTerm]
            return broaderterms[terminal]
        except KeyError:
            pass


    # a function to get a list of all alt terms for a term
    def getaltterms(term):
        """
        Retrieves alternative labels for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of alternative labels.
        """
        terminal = rdflib.term.URIRef(term)
        alternateterms = {}
        try:
            for alternateTerm in graph.objects(subject=terminal, predicate=altLabel):
                try:
                    alternateterms[terminal].append(alternateTerm)
                except KeyError:
                    alternateterms[terminal] = [alternateTerm]
            return alternateterms[terminal]
        except KeyError:
            pass


    # a function to get a list of all related terms for a term
    def getrelatedterms(term):
        """
        Retrieves related terms for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of related terms.
        """
        terminal = rdflib.term.URIRef(term)
        relatedterms = {}
        try:
            for relatedTerm in graph.objects(subject=terminal, predicate=related):
                try:
                    relatedterms[terminal].append(relatedTerm)
                except KeyError:
                    relatedterms[terminal] = [relatedTerm]
            return relatedterms[terminal]
        except KeyError:
            pass

        # a function to return editorial notes for a term


    def getednotes(term):
        """
        Retrieves editorial notes for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of editorial notes.
        """
        uriTerm = rdflib.term.URIRef(term)
        # each editorial note in pool party is its own note to iterate over
        edlist = []
        for ednoteterm in graph.objects(subject=uriTerm, predicate=ednotes):
            for t in graph.objects(subject=ednoteterm, predicate=title):
                for z in graph.objects(subject=ednoteterm, predicate=comment):
                    edlist.append({"title": t, "comment": z})

        if not edlist:
            return None
        else:
            return edlist


    # a function to return change notes for a term
    def getchangenotes(term):
        """
        Retrieves change notes for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            list: A list of change notes.
        """
        uriTerm = rdflib.term.URIRef(term)
        # each editorial note in pool party is its own note to iterate over
        chlist = []
        for chnoteterm in graph.objects(subject=uriTerm, predicate=chnotes):
            for t in graph.objects(subject=chnoteterm, predicate=title):
                for z in graph.objects(subject=chnoteterm, predicate=comment):
                    chlist.append({"title": t, "comment": z})

        if not chlist:
            return None
        else:
            return chlist


    # a function to return scope notes for a term
    def getscopenotes(term):
        """
        Retrieves scope notes for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            str: The scope note.
        """
        uriTerm = rdflib.term.URIRef(term)
        for scnoteterm in graph.objects(subject=uriTerm, predicate=scopenotes):
            return scnoteterm


    # a function to return example notes for a term
    def getexample(term):
        """
         Retrieves examples for a given term.

         Args:
             term (str): The URI of the term.

         Returns:
             list: A list of examples.
         """
        uriTerm = rdflib.term.URIRef(term)
        exlist = []
        for termex in graph.objects(subject=uriTerm, predicate=example):
            exlist.append(termex)

        if not exlist:
            return None
        else:
            return exlist


    # a function to return the status of a term
    def getdefinition(term):
        """
        Retrieves the definition for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            str: The definition.
        """
        uriTerm = rdflib.term.URIRef(term)
        for deftest in graph.objects(subject=uriTerm, predicate=definition):
            return deftest

    def literal(term):
        """
        Retrieves the preferred label for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            str: The preferred label in English.
        """
        uriTerm = rdflib.term.URIRef(term)
        for prefterm in graph.objects(subject=uriTerm, predicate=prefLabel):
            if prefterm.language == "en":  # print only main english language for main pref label
                return prefterm


    def getlabel(term):
        """
        Retrieves the label for a given term.

        Args:
            term (str): The URI of the term.

        Returns:
            str: The label
        """
        uriTerm = rdflib.term.URIRef(term)
        for deplabel in graph.objects(subject=uriTerm, predicate=label):
            return deplabel


    def getdepstatus(term):
        """
        Checks if a term is deprecated.

        Args:
            term (str): The URI of the term.

        Returns:
            bool: True if the term is deprecated, False otherwise.
        """
        uriTerm = rdflib.term.URIRef(term)
        for depcon in graph.objects(subject=uriTerm, predicate=dep):
            return depcon

    logger.info("Processing RDF data...")

    alluat = []
    flat_j = {}
    deprecated = []
    # writes a html file for each term
    for term in allconcepts:
        # get all the info for each term

        depstatus = getdepstatus(term)
        if str(depstatus) == "true":
            deprecated.append(term)
        else:  # if concept is NOT deprecated
            litt = literal(term)
            onecon = {"uri": term, "name": litt}

            nts = getnarrowerterms(term)
            ntlist = []
            rcl = []
            if nts is not None:
                for narrowerTerm in nts:
                    y = literal(narrowerTerm)
                    unt = {"name": y, "uri": narrowerTerm}
                    ntlist.append(unt)
                    rcl.append(y)
                onecon["narrower"] = ntlist
            else:
                onecon["narrower"] = nts

            bts = getbroaderterms(term)
            btlist = []
            pl = []
            if bts is not None:
                for broaderTerm in bts:
                    y = literal(broaderTerm)
                    ubt = {"name": y, "uri": broaderTerm}
                    btlist.append(ubt)
                    pl.append(y)
                onecon["broader"] = btlist
            else:
                onecon["broader"] = bts
                pl = ["astro_thes"]

            ats = getaltterms(term)
            onecon["altNames"] = ats

            rts = getrelatedterms(term)
            rtlist = []
            if rts is not None:
                for relatedTerm in rts:
                    urt = {"name": literal(relatedTerm), "uri": relatedTerm}
                    rtlist.append(urt)
                onecon["related"] = rtlist
            else:
                onecon["related"] = rts
                rtlist = None

            onecon["changeNotes"] = getchangenotes(term)
            onecon["scopeNotes"] = getscopenotes(term)
            onecon["examples"] = getexample(term)
            onecon["definition"] = getdefinition(term)
            onecon["editorialNotes"] = getednotes(term)

            alluat.append(onecon)

            flat_j[litt] = {

                "parents": pl,
                "children": [],
                "real_children": rcl,
                "uri": term,
                "altLabels": ats,
                "related": rtlist,
                "changeNotes": onecon["changeNotes"],
                "scopeNotes": onecon["scopeNotes"],
                "examples": onecon["examples"],
                "definition": onecon["definition"],
                "editorialNotes": onecon["editorialNotes"],
            }

    astro_thes = {"children": []}

    # Precompute parent-child relationships
    parent_to_children = {}
    for f, data in flat_j.items():
        for parent in data["parents"]:
            parent_to_children.setdefault(parent, []).append(f)

    # Use a stack for iterative traversal
    stack = [(astro_thes, "astro_thes")]
    while stack:
        current_dict, current_name = stack.pop()
        children = parent_to_children.get(current_name, [])
        for child in children:
            child_data = flat_j[child]
            child_dict = {
                "name": child,
                "uri": child_data["uri"],
                "altLabels": child_data["altLabels"],
                "related": child_data["related"],
                "changeNotes": child_data["changeNotes"],
                "scopeNotes": child_data["scopeNotes"],
                "examples": child_data["examples"],
                "definition": child_data["definition"],
                "editorialNotes": child_data["editorialNotes"],
                "children": [],
            }
            current_dict["children"].append(child_dict)
            stack.append((child_dict, child))
        if len(current_dict["children"]) <= 0:
            del current_dict["children"]
        else:
            current_dict["children"].sort(key=lambda item: item.get("name"))

    # now go through all the deprecated concepts
    alldep = []
    for term in deprecated:
        onecon = {"uri": term, "name": getlabel(term), "status": "deprecated"}

        chnote = getchangenotes(term)
        uselist = []
        if chnote is not None:
            for x in chnote:
                if str(x["title"]) == 'Use instead':
                    uselist.append(x["comment"])

            onecon["useInstead"] = uselist

        alluat.append(onecon)
        alldep.append(onecon)

    astro_thes["deprecated"] = alldep

    logger.info("Finished processing RDF data.")

    return alluat, astro_thes
