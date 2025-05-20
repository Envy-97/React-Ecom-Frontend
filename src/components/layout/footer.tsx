export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Ethereal Emporium. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Crafted with care for your ethereal shopping experience.
        </p>
      </div>
    </footer>
  );
}
