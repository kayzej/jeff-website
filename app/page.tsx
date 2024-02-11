export default function Home() {
  fetch("jeff-website-api-0.0.1-SNAPSHOT/helloworld")
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  return (
    <div className="flex flex-col h-screen column items-center justify-center">
      <h1 className="font-bold">Welcome to Jeff{'\u0027'}s Website!</h1>
      <p>We are currently under maintenance and will be up and running soon!</p>
      <p>Also, AWS is a POS</p>
    </div>
  );
}
