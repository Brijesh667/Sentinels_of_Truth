export default function About() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 px-6 py-12">
            <div className="max-w-6xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6 text-black">AI Fact Validator</h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        An intelligent AI-powered fact verification platform designed to detect
                        misinformation, verify factual claims, and provide fast semantic search-based
                        fact-checking using modern AI and vector database technology.
                    </p>
                </div>

                {/* About */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-10">
                    <h2 className="text-3xl font-semibold mb-4 text-black">About The Project</h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                        AI Fact Validator is a smart verification system built to analyze factual
                        claims submitted by users and determine whether the information is accurate
                        or misleading. The platform combines AI reasoning, live web evidence, and
                        semantic similarity search to deliver reliable verification results.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg mt-4">
                        Unlike traditional keyword-based systems, this project uses vector embeddings
                        and semantic understanding to identify duplicate claims, detect contradictions,
                        and provide intelligent query suggestions from previously verified data.
                    </p>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-10">
                    <h2 className="text-3xl font-semibold mb-6 text-black">Key Features</h2>
                    <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg">
                        <li>Real-time AI fact verification</li>
                        <li>Web evidence-based claim analysis</li>
                        <li>Semantic duplicate claim detection</li>
                        <li>Contradiction identification</li>
                        <li>Human review flagging for uncertain cases</li>
                        <li>Vector database-powered query suggestions</li>
                        <li>Fast retrieval of previously verified claims</li>
                    </ul>
                </div>

                {/* Workflow */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-10">
                    <h2 className="text-3xl font-semibold mb-6 text-black">How It Works</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700 text-lg">
                        <li>User enters a factual claim.</li>
                        <li>AI verification agent analyzes the claim using web evidence.</li>
                        <li>A verification result is generated with confidence score and evidence summary.</li>
                        <li>Secondary AI system compares the result with vector database records.</li>
                        <li>Duplicate, contradictory, or new claims are identified and handled accordingly.</li>
                    </ol>
                </div>

                {/* Tech Stack */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-10">
                    <h2 className="text-3xl font-semibold mb-6 text-black">Technology Stack</h2>
                    <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg">
                        <li><strong className="text-black">Frontend:</strong> React, Tailwind CSS</li>
                        <li><strong className="text-black">Backend:</strong> Node.js, Express.js</li>
                        <li><strong className="text-black">AI Models:</strong> Google Gemini 2.5 Flash/Provide model name and api key to use another model</li>
                        <li><strong className="text-black">Embeddings:</strong> Gemini Embedding Model</li>
                        <li><strong className="text-black">Database:</strong> Pinecone Vector Database</li>
                        <li><strong className="text-black">External Tools:</strong> Web Search APIs</li>
                    </ul>
                </div>

                {/* Purpose */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-semibold mb-4 text-black">Project Purpose</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        This project aims to combat misinformation by providing users with a fast,
                        intelligent, and scalable fact verification system. It demonstrates how AI,
                        semantic search, and modern web technologies can be integrated to create
                        practical real-world misinformation detection solutions.
                    </p>
                </div>

            </div>
        </div>
    );
}