const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },

  /**
   * الصور الخارجية.
   *
   * Next.js بيرفض عرض أي صورة من نطاق مش مكتوب هنا — إجراء أمني عشان محدش
   * يستخدم خادم الموقع كوسيط لتحميل صور من أي مكان.
   *
   * الملف ده كان فيه `picsum.photos` وبس (أيام الصور العشوائية). لما بقينا
   * نرفع على Cloudinary، الصورة كانت بتترفع وبتتحفظ في قاعدة البيانات
   * بنجاح — وبعدين Next.js يرفض يعرضها، فتظهر مكسورة.
   */
  images: {
    remotePatterns: [
      {
        // صور الموقع والمنتجات والصور الشخصية وأغلفة المقالات.
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        // الحرف الأول من اسم المدرب لما ما يكونش رافع صورة شخصية.
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        // بيانات تجريبية للتطوير المحلي فقط — مش مستخدمة على الموقع.
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
